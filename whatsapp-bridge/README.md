# Puente de WhatsApp para Ana's Pastry Shop

Este servicio vincula una cuenta de WhatsApp mediante QR y entrega avisos de pago y boletines desde la cola `WhatsAppNotification`. No importa conversaciones ni mensajes antiguos.

## Render

1. Crea un Blueprint con el `render.yaml` de la raíz del repositorio. Debe crear el servicio `anaspastryshop-whatsapp-bridge` con plan gratuito.
2. Asigna `DATABASE_URL` con la **cadena directa** `POSTGRES_URL` de Prisma Postgres (`postgres://...@db.prisma.io:5432/...`). La URL `prisma+postgres://` usada por Vercel no funciona en este puente. Copia solamente el valor de `POSTGRES_URL`, sin el nombre de la variable.
3. Genera una clave aleatoria para `BRIDGE_API_KEY` y guárdala también en Vercel como `WA_BRIDGE_API_KEY`. Configura en Vercel `WA_BRIDGE_URL` con la URL pública del servicio Render.
4. En `/dashboard/settings`, como administrador, pulsa **Generar QR** y escanéalo desde WhatsApp > Dispositivos vinculados. El servicio guarda la sesión en PostgreSQL.

Antes del despliegue, aplica las migraciones `20261103000000_add_whatsapp_contact` y `20261103010000_whatsapp_notifications`. Con acceso TCP a Prisma Postgres, usa `prisma migrate deploy` con `POSTGRES_URL` como `DATABASE_URL`. Si la red solo permite HTTPS, desde este directorio y con `DATABASE_URL` configurada ejecuta `npm run db:migrate`; ese script aplica ambas migraciones en transacciones y registra sus sumas SHA-256 en `_prisma_migrations`.

El plan gratuito de Render puede suspender el servicio tras inactividad. Los avisos quedan en PostgreSQL y se procesan cuando vuelve a conectarse. Un envío interrumpido queda como `needs_review` para evitar duplicados automáticos.
