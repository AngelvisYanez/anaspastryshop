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
const state = { sock: null, status: 'close', qr: null, starting: false, stopping: false };

async function start() {
  if (state.starting || state.sock) return;
  state.starting = true;
  try {
    const { state: auth, saveCreds } = await usePostgresAuthState('default');
    let version;
    try { version = (await fetchLatestBaileysVersion()).version; } catch { version = undefined; }
    const sock = makeWASocket({ version, auth, logger, browser: ['Ubuntu', 'Chrome', '120.0.0'], markOnlineOnConnect: false, syncFullHistory: false });
    state.sock = sock;
    state.status = 'connecting';
    sock.ev.on('creds.update', () => saveCreds().catch((e) => console.error('No se pudo guardar la sesión:', e)));
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      if (state.sock !== sock) return;
      if (qr) state.qr = await QRCode.toDataURL(qr);
      if (connection === 'open') {
        state.status = 'open'; state.qr = null;
        await exec('INSERT INTO "WhatsAppConnection" ("instance","linkedAt") VALUES ($1,NOW()) ON CONFLICT ("instance") DO UPDATE SET "linkedAt"=EXCLUDED."linkedAt"', 'default');
        void dispatch();
      }
      if (connection === 'close') {
        state.sock = null; state.status = 'close'; state.qr = null;
        if (state.stopping) return;
        if (lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut) {
          await clearSession('default');
        } else setTimeout(() => start().catch(console.error), 3000);
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
    try {
      if (item.kind === 'MARKETING') {
        const allowed = await query('SELECT "id" FROM "User" WHERE "id"=$1 AND "whatsappMarketing"=TRUE AND REGEXP_REPLACE("whatsappNumber",\'[^0-9]\',\'\',\'g\')=$2 AND EXISTS (SELECT 1 FROM "Inscription" WHERE "userId"=$1 AND "status"=\'APPROVED\')', item.userId, item.phone);
        if (!allowed.length) { await exec('UPDATE "WhatsAppNotification" SET "status"=\'cancelled\', "lockedAt"=NULL WHERE "id"=$1', item.id); continue; }
      }
      const response = await state.sock.sendMessage(`${item.phone}@s.whatsapp.net`, { text: item.text });
      await exec('UPDATE "WhatsAppNotification" SET "status"=\'sent\', "sentAt"=NOW(), "messageId"=$2, "lockedAt"=NULL WHERE "id"=$1', item.id, response?.key?.id || null);
      sent++;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      // A timeout after send can be ambiguous. Leave the item for manual review to avoid duplicate sends.
      await exec('UPDATE "WhatsAppNotification" SET "status"=\'needs_review\', "lastError"=$2, "lockedAt"=NULL WHERE "id"=$1', item.id, String(error?.message || error).slice(0, 500));
    }
  }
  return sent;
  } finally { dispatching = false; }
}

app.get('/health', (_req, res) => res.json({ ok: true, connected: state.status === 'open' }));
app.use((req, res, next) => req.get('apikey') === apiKey ? next() : res.status(401).json({ error: 'No autorizado' }));
app.get('/instance/connectionState/default', (_req, res) => res.json({ instance: { state: state.status } }));
app.get('/instance/connect/default', async (_req, res) => {
  try {
    await start();
    if (!state.qr && state.status !== 'open') await new Promise((resolve) => setTimeout(resolve, 1500));
    res.json({ state: state.status, qr: state.qr });
  } catch { res.status(503).json({ error: 'No se pudo iniciar la sesión de WhatsApp. Revisa la base de datos y los logs de Render.' }); }
});
app.delete('/instance/logout/default', async (_req, res) => {
  state.stopping = true;
  try { await state.sock?.logout(); } catch { /* already disconnected */ }
  state.sock = null; state.status = 'close'; state.qr = null;
  await clearSession('default');
  state.stopping = false;
  res.json({ ok: true });
});
app.post('/dispatch', async (_req, res) => {
  try { res.json({ sent: await dispatch(), connected: state.status === 'open' }); }
  catch { res.status(503).json({ error: 'No se pudieron procesar los avisos pendientes.' }); }
});
app.listen(port, '0.0.0.0', () => console.log(`WhatsApp bridge listening on ${port}`));
exec('UPDATE "WhatsAppNotification" SET "status"=\'needs_review\', "lastError"=\'El servicio se reinició durante el envío; revisar antes de reenviar\', "lockedAt"=NULL WHERE "status"=\'sending\'').catch(console.error);
start().catch((error) => console.error('No se pudo iniciar WhatsApp:', error));
setInterval(() => { void dispatch().catch(console.error); }, 30000);
