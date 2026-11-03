import { query } from './store.js';

const columns = await query("SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name IN ('whatsappNumber','whatsappMarketing')");
const migrations = await query("SELECT migration_name FROM _prisma_migrations WHERE migration_name LIKE '20261103%' ORDER BY migration_name");
console.log('WhatsApp columns:', columns.map((row) => row.column_name).sort().join(', ') || 'none');
console.log('WhatsApp migrations:', migrations.map((row) => row.migration_name).join(', ') || 'none');
