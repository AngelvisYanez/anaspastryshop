import express from 'express';
import Pino from 'pino';
import QRCode from 'qrcode';
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import { query, exec, usePostgresAuthState, clearSession } from './store.js';

const port = Number(process.env.PORT || 8080);
const apiKey = process.env.BRIDGE_API_KEY;
if (!apiKey) throw new Error('BRIDGE_API_KEY es obligatoria');
const logger = Pino({ level: process.env.LOG_LEVEL || 'silent' });
const app = express();
app.use(express.json());
const state = { sock: null, status: 'close', qr: null, pairingCode: null, phone: null, starting: false, stopping: false };
let reconnectTimer = null;
let sessionGeneration = 0;
let pairingRequest = false;
let credentialWrite = Promise.resolve();

async function start() {
  if (state.starting || state.sock || state.stopping) return;
  state.starting = true;
  const generation = sessionGeneration;
  try {
    const { state: auth, saveCreds } = await usePostgresAuthState('default');
    let version;
    try { version = (await fetchLatestBaileysVersion()).version; } catch { version = undefined; }
    if (state.stopping || generation !== sessionGeneration) return;
    const sock = makeWASocket({ version, auth, logger, browser: ['Ubuntu', 'Chrome', '120.0.0'], markOnlineOnConnect: false, syncFullHistory: false });
    state.sock = sock;
    state.status = auth.creds.registered ? 'reconnecting' : 'connecting';
    state.phone = auth.creds.registered ? auth.creds.me?.id?.split('@')[0]?.split(':')[0] || null : null;
    sock.ev.on('creds.update', () => {
      if (state.sock === sock && !state.stopping) {
        credentialWrite = credentialWrite.then(saveCreds).catch((e) => console.error('No se pudo guardar la sesión:', e));
      }
    });
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr, isNewLogin }) => {
      if (state.sock !== sock) return;
      if (qr) state.qr = await QRCode.toDataURL(qr);
      if (isNewLogin) {
        state.status = 'pairing';
        state.qr = null;
        state.pairingCode = null;
        state.phone = sock.user?.id?.split('@')[0]?.split(':')[0] || null;
      }
      if (connection === 'open') {
        state.status = 'open'; state.qr = null; state.pairingCode = null;
        state.phone = (sock.user?.id || auth.creds.me?.id)?.split('@')[0]?.split(':')[0] || null;
        await exec('INSERT INTO "WhatsAppConnection" ("instance","linkedAt") VALUES ($1,NOW()) ON CONFLICT ("instance") DO UPDATE SET "linkedAt"=EXCLUDED."linkedAt"', 'default');
        void dispatch();
      }
      if (connection === 'close') {
        const wasPairing = state.status === 'pairing';
        state.sock = null; state.status = wasPairing ? 'pairing' : auth.creds.registered ? 'reconnecting' : 'close'; state.qr = null; state.pairingCode = null;
        if (state.stopping) return;
        await credentialWrite;
        console.warn('[whatsapp] Conexión cerrada; código:', lastDisconnect?.error?.output?.statusCode ?? 'desconocido');
        if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
          state.status = 'close'; state.phone = null;
          await clearSession('default');
        } else reconnectTimer = setTimeout(() => { reconnectTimer = null; start().catch(console.error); }, 3000);
      }
    });
  } finally { state.starting = false; }
}

let dispatching = false;
async function dispatch() {
  if (dispatching) return 0;
  if (state.status !== 'open' || !state.sock) return 0;
  dispatching = true;
  try {
  let sent = 0;
  for (let i = 0; i < 20; i++) {
    const rows = await query(`UPDATE "WhatsAppNotification" SET "status"='sending', "lockedAt"=NOW(), "attempts"="attempts"+1 WHERE "id"=(SELECT "id" FROM "WhatsAppNotification" WHERE "status"='pending' AND "availableAt"<=NOW() ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`);
    const item = rows[0];
    if (!item) break;
    let sendTimer;
    let timedOut = false;
    try {
      if (item.kind === 'ADMIN' || item.eventKey.startsWith('admin:')) {
        const admins = await query('SELECT "id" FROM "User" WHERE "role"=\'ADMIN\' AND "isActive"=TRUE AND REGEXP_REPLACE("whatsappNumber",\'[^0-9]\',\'\',\'g\')=$1 LIMIT 1', item.phone);
        if (!admins.length) {
          await exec('UPDATE "WhatsAppNotification" SET "status"=\'cancelled\', "lastError"=\'El número destinatario no pertenece a un administrador activo\', "lockedAt"=NULL WHERE "id"=$1', item.id);
          continue;
        }
      }
      if (item.kind === 'MARKETING') {
        const allowed = await query('SELECT "id" FROM "User" WHERE "id"=$1 AND "whatsappMarketing"=TRUE AND REGEXP_REPLACE("whatsappNumber",\'[^0-9]\',\'\',\'g\')=$2 AND EXISTS (SELECT 1 FROM "Inscription" WHERE "userId"=$1 AND "status"=\'APPROVED\')', item.userId, item.phone);
        if (!allowed.length) { await exec('UPDATE "WhatsAppNotification" SET "status"=\'cancelled\', "lockedAt"=NULL WHERE "id"=$1', item.id); continue; }
      }
      const response = await Promise.race([
        state.sock.sendMessage(`${item.phone}@s.whatsapp.net`, { text: item.text }),
        new Promise((_, reject) => {
          sendTimer = setTimeout(() => {
            timedOut = true;
            reject(new Error('WhatsApp no confirmó el envío en 45 segundos'));
          }, 45000);
        }),
      ]);
      await exec('UPDATE "WhatsAppNotification" SET "status"=\'sent\', "sentAt"=NOW(), "messageId"=$2, "lockedAt"=NULL WHERE "id"=$1', item.id, response?.key?.id || null);
      sent++;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      // A timeout after send can be ambiguous. Leave the item for manual review to avoid duplicate sends.
      await exec('UPDATE "WhatsAppNotification" SET "status"=\'needs_review\', "lastError"=$2, "lockedAt"=NULL WHERE "id"=$1', item.id, String(error?.message || error).slice(0, 500));
      if (timedOut) break;
    } finally {
      clearTimeout(sendTimer);
    }
  }
  return sent;
  } finally { dispatching = false; }
}

app.get('/health', (_req, res) => res.json({ ok: true, connected: state.status === 'open' }));
app.use((req, res, next) => req.get('apikey') === apiKey ? next() : res.status(401).json({ error: 'No autorizado' }));
app.get('/instance/connectionState/default', (_req, res) => res.json({ instance: { state: state.status, phone: state.phone }, qr: state.qr, pairingCode: state.pairingCode }));
app.get('/instance/connect/default', async (_req, res) => {
  try {
    await start();
    if (!state.qr && state.status !== 'open') await new Promise((resolve) => setTimeout(resolve, 1500));
    res.json({ state: state.status, qr: state.qr });
  } catch { res.status(503).json({ error: 'No se pudo iniciar la sesión de WhatsApp. Revisa la base de datos y los logs de Render.' }); }
});
app.post('/instance/pairing-code/default', async (req, res) => {
  const phone = String(req.body?.phone ?? '').replace(/\D/g, '');
  if (!/^[1-9]\d{7,14}$/.test(phone)) return res.status(400).json({ error: 'Escribe el número con código de país, sin el signo +.' });
  if (state.status === 'open') return res.status(409).json({ error: 'Desvincula la cuenta actual antes de solicitar otro código.' });
  if (pairingRequest) return res.status(409).json({ error: 'Ya se está generando un código. Espera unos segundos.' });
  pairingRequest = true;
  try {
    await start();
    // Baileys can request a code only after its socket receives the first QR.
    for (let i = 0; i < 20 && !state.qr && state.status !== 'open'; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!state.sock || !state.qr || state.status === 'open') {
      return res.status(503).json({ error: 'WhatsApp aún no está listo. Intenta de nuevo en unos segundos.' });
    }
    const sock = state.sock;
    const code = await sock.requestPairingCode(phone);
    if (state.sock !== sock || state.status === 'open') return res.status(409).json({ error: 'La sesión cambió. Consulta el estado e intenta de nuevo.' });
    state.pairingCode = code;
    res.json({ state: state.status, pairingCode: code });
  } catch (error) {
    console.error('No se pudo solicitar el código de vinculación:', error);
    res.status(503).json({ error: 'No se pudo generar el código. Intenta de nuevo en unos segundos.' });
  } finally { pairingRequest = false; }
});
app.delete('/instance/logout/default', async (_req, res) => {
  state.stopping = true;
  sessionGeneration++;
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  const oldSocket = state.sock;
  state.sock = null; state.status = 'close'; state.qr = null; state.pairingCode = null; state.phone = null;
  try {
    try { await oldSocket?.logout(); } catch { /* already disconnected */ }
    oldSocket?.end(undefined);
    await credentialWrite;
    await clearSession('default');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ error: 'No se pudo borrar la sesión anterior.' });
  } finally { state.stopping = false; }
});
app.post('/dispatch', async (_req, res) => {
  try { res.json({ sent: await dispatch(), connected: state.status === 'open' }); }
  catch { res.status(503).json({ error: 'No se pudieron procesar los avisos pendientes.' }); }
});
app.listen(port, '0.0.0.0', () => console.log(`WhatsApp bridge listening on ${port}`));
exec('UPDATE "WhatsAppNotification" SET "status"=\'needs_review\', "lastError"=\'El servicio se reinició durante el envío; revisar antes de reenviar\', "lockedAt"=NULL WHERE "status"=\'sending\'').catch(console.error);
start().catch((error) => console.error('No se pudo iniciar WhatsApp:', error));
setInterval(() => { void dispatch().catch(console.error); }, 30000);
