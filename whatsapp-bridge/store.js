import { prismaPostgres, defaultClientConfig } from "@prisma/ppg";
import { BufferJSON, initAuthCreds, proto } from "@whiskeysockets/baileys";

const raw = process.env.DATABASE_URL?.trim().replace(/^=+(?=postgres(?:ql)?:\/\/)/i, "");
if (!raw) throw new Error("DATABASE_URL es obligatoria");
try {
  const parsed = new URL(raw);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error("protocol");
} catch { throw new Error("DATABASE_URL debe ser una URL PostgreSQL válida"); }
const db = prismaPostgres(defaultClientConfig(raw));
export const query = (sql, ...params) => db.query(sql, ...params).collect();
export const exec = (sql, ...params) => db.exec(sql, ...params);
export const transaction = (callback) => db.transaction(callback);
const serialize = (value) => JSON.stringify(value, BufferJSON.replacer);
const deserialize = (value) => JSON.parse(JSON.stringify(value), BufferJSON.reviver);

export async function usePostgresAuthState(instance) {
  const rows = await query('SELECT "payload" FROM "WhatsAppAuthState" WHERE "instance"=$1 AND "key"=$2', instance, 'creds');
  const creds = rows[0] ? deserialize(rows[0].payload) : initAuthCreds();
  return {
    state: { creds, keys: {
      get: async (category, ids) => {
        if (!ids.length) return {};
        const keys = ids.map((id) => `${category}:${id}`);
        const rows = await query(`SELECT "key", "payload" FROM "WhatsAppAuthState" WHERE "instance"=$1 AND "key" IN (${keys.map((_, i) => `$${i + 2}`).join(',')})`, instance, ...keys);
        const result = {};
        for (const row of rows) {
          const value = deserialize(row.payload);
          result[row.key.slice(category.length + 1)] = category === 'app-state-sync-key' ? proto.Message.AppStateSyncKeyData.fromObject(value) : value;
        }
        return result;
      },
      set: async (data) => {
        const operations = [];
        for (const [category, entries] of Object.entries(data)) for (const [id, value] of Object.entries(entries)) {
          const key = `${category}:${id}`;
          operations.push(value == null
            ? { exec: 'DELETE FROM "WhatsAppAuthState" WHERE "instance"=$1 AND "key"=$2', parameters: [instance, key] }
            : { exec: 'INSERT INTO "WhatsAppAuthState" ("instance","key","payload") VALUES ($1,$2,$3::jsonb) ON CONFLICT ("instance","key") DO UPDATE SET "payload"=EXCLUDED."payload"', parameters: [instance, key, serialize(value)] });
        }
        if (operations.length) await db.batch(...operations);
      },
    } },
    saveCreds: () => exec('INSERT INTO "WhatsAppAuthState" ("instance","key","payload") VALUES ($1,$2,$3::jsonb) ON CONFLICT ("instance","key") DO UPDATE SET "payload"=EXCLUDED."payload"', instance, 'creds', serialize(creds)),
  };
}

export async function clearSession(instance) {
  await db.batch(
    { exec: 'DELETE FROM "WhatsAppAuthState" WHERE "instance"=$1', parameters: [instance] },
    { exec: 'DELETE FROM "WhatsAppConnection" WHERE "instance"=$1', parameters: [instance] },
  );
}
