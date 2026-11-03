import { readFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { query, transaction } from './store.js';

for (const name of ['20261103000000_add_whatsapp_contact', '20261103010000_whatsapp_notifications']) {
  const sql = await readFile(new URL(`../prisma/migrations/${name}/migration.sql`, import.meta.url), 'utf8');
  const checksum = createHash('sha256').update(sql).digest('hex');
  const existing = await query('SELECT "checksum", "finished_at" FROM "_prisma_migrations" WHERE "migration_name"=$1 AND "rolled_back_at" IS NULL', name);
  if (existing.length) {
    if (!existing[0].finished_at || existing[0].checksum !== checksum) throw new Error(`Migración ${name} incompleta o diferente`);
    console.log(`${name}: ya aplicada`);
    continue;
  }
  await transaction(async (tx) => {
    for (const statement of sql.split(';').map((part) => part.trim()).filter(Boolean)) await tx.exec(statement);
    await tx.exec('INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count") VALUES ($1,$2,NOW(),$3,NULL,NULL,NOW(),$4)', randomUUID(), checksum, name, sql.split(';').filter((part) => part.trim()).length);
  });
  console.log(`${name}: aplicada`);
}
