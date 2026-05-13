---
name: "SEO, Pagos, Roles y Layout"
overview: "Plan para mejorar rutas SEO en español, corregir el flujo de pago con comprobante, habilitar registro sin membresía con condicionamiento, verificar roles y garantizar Navbar+Footer en todas las páginas."
todos:
  - id: "seo-routes"
    content: "Crear nuevas rutas en español y agregar redirects 301 en next.config.ts"
    status: not_started
  - id: "fix-checkout-navbar"
    content: "Eliminar doble Navbar en checkout, agregar Footer al layout de pago y al checkout success"
    status: not_started
  - id: "receipt-fallback"
    content: "Agregar fallback base64 en upload-image cuando Cloudflare no está configurado"
    status: not_started
  - id: "registration-flow"
    content: "Redirigir post-registro a /membresia?bienvenida=true y mostrar banner en dashboard para usuarios sin membresía"
    status: not_started
  - id: "roles-review"
    content: "Permitir visitantes ver webinars (sin forzar login), verificar sidebar por rol"
    status: not_started
  - id: "navbar-footer-all"
    content: "Agregar Navbar+Footer a páginas de registro y confirmación de pago"
    status: not_started
  - id: "update-internal-links"
    content: "Actualizar hrefs en Navbar, Footer, y redirect() server-side a las nuevas rutas en español"
    status: not_started
  - id: "sitemap-update"
    content: "Actualizar sitemap.ts con las nuevas rutas canónicas en español"
    status: not_started
createdAt: "2026-05-13T14:25:48.964Z"
updatedAt: "2026-05-13T14:28:17.030Z"
---

# Plan: SEO, Pagos, Registro y Layout

## 1. Rutas SEO en Español

Mover directorios y agregar redirects 301 en `next.config.ts`:

| Ruta actual | Nueva ruta |
|---|---|
| `/auth/login` | `/iniciar-sesion` |
| `/auth/signup` | `/registro` |
| `/auth/signup-mentor` | `/registro-mentor` |
| `/auth/forgot-password` | `/olvide-mi-contrasena` |
| `/auth/reset-password` | `/restablecer-contrasena` |
| `/checkout/membresia` | `/pagar/membresia` |
| `/checkout/success` | `/pagar/confirmacion` |

- Crear nuevos directorios con `page.tsx` que re-export los componentes existentes
- Añadir redirects permanentes en `next.config.ts` de las rutas viejas a las nuevas
- Actualizar `redirect()` server-side en: `webinars/page.tsx`, `mis-cursos/page.tsx`, `dashboard/layout.tsx`, `cursos/[id]/lesson/[lessonId]/page.tsx`
- Actualizar `Link` href en: `Navbar.tsx`, `Footer.tsx`, `CheckoutMembresia.tsx`, páginas de auth
- Actualizar `sitemap.ts` con nuevas rutas relevantes

## 2. Proceso de Pago con Comprobante

El upload de comprobante ya existe en `CheckoutMembresia.tsx` pero tiene problemas:

**Bug crítico**: `checkout/layout.tsx` Y `CheckoutMembresia.tsx` ambos renderizan `<Navbar />` (doble navbar). Eliminar de `CheckoutMembresia.tsx` y remover el checkout layout (mover Navbar al nuevo `pagar/layout.tsx` o directamente en la página).

**Fallback base64 en DB**: El endpoint `app/api/cloudflare/upload-image/route.ts` actualmente devuelve error 500 si no hay credenciales de Cloudflare. Cambiar para que, cuando no estén configuradas, convierta el archivo a base64 data URL y lo retorne directamente:

```ts
// Si Cloudflare no está configurado → fallback base64
if (!accountId || !apiToken) {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;
  return NextResponse.json({ url: dataUrl });
}
```

El campo `receiptImage String?` en el modelo `Inscription` (schema.prisma:100) ya es `text` en PostgreSQL — puede almacenar tanto URLs como strings base64. La action `createSubscriptionInscription` (lib/actions/inscription.ts:50-55) ya guarda `receiptImage` sin modificaciones, entonces el flujo completo funciona sin cambios adicionales.

**Validación de tamaño**: Agregar límite de 5MB en el endpoint para evitar strings base64 excesivamente grandes en la DB.

## 3. Registro Sin Membresía + Condicionamiento

- La página `/registro` (ex-signup) ya permite registro gratuito. Después del registro, redirigir a `/membresia?bienvenida=true` mostrando un banner de bienvenida en lugar de solo ir al login.
- En el dashboard (`DashboardShell`), si el usuario `USER` no tiene suscripción activa ni pago pendiente, mostrar un banner persistente que invite a comprar la membresía (link a `/pagar/membresia`).
- Verificar que `PendingPaymentDialog` solo aparece cuando hay pago PENDIENTE, no para todos los sin-membresía.

## 4. Verificación de Roles

Roles: ADMIN, MENTOR, USER (alumno), Visitante

Issues identificados:
- **Visitante**: `/webinars/page.tsx` line 100 fuerza redirect a login. Cambiar para mostrar la lista de webinars públicamente (bloqueando solo el acceso directo al webinar).
- **USER sin membresía**: Dashboard accesible pero vacío — agregar banner de membresía requerida.
- **MENTOR**: La sidebar ya filtra por rol correctamente. Verificar que el bloqueo por foto falta no rompe el flujo.
- **ADMIN**: Acceso completo — verificar que sidebar muestra todos los items.

## 5. Navbar + Footer en Todas las Páginas

Páginas con problemas:

| Página | Problema |
|---|---|
| `app/auth/signup/page.tsx` | Sin Navbar ni Footer |
| `app/auth/signup-mentor/page.tsx` | Sin Navbar ni Footer |
| `app/checkout/success/page.tsx` | Sin Navbar ni Footer |
| `app/checkout/membresia/CheckoutMembresia.tsx` | Navbar duplicado (layout + componente) |
| `app/checkout/layout.tsx` | Sin Footer |

Solución: En las páginas renombradas (nuevas rutas), incluir `<Navbar forceSolid />` y `<Footer />` en las que corresponde (signup, signup-mentor). Agregar Footer al layout de pagar/. Eliminar el `<Navbar />` dentro de `CheckoutMembresia.tsx`.

## Archivos clave a modificar

- `next.config.ts` — redirects 301
- `app/pagar/layout.tsx` — nuevo layout con Navbar + Footer
- `app/registro/page.tsx` — nuevo (basado en auth/signup)
- `app/registro-mentor/page.tsx` — nuevo (basado en auth/signup-mentor)
- `app/iniciar-sesion/page.tsx` — nuevo (basado en auth/login)
- `app/olvide-mi-contrasena/page.tsx` — nuevo (basado en auth/forgot-password)
- `app/restablecer-contrasena/page.tsx` — nuevo (basado en auth/reset-password)
- `app/pagar/membresia/page.tsx` + `CheckoutMembresia.tsx` — mover y fijar doble Navbar
- `app/pagar/confirmacion/page.tsx` — nuevo (basado en checkout/success)
- `app/api/cloudflare/upload-image/route.ts` — fallback base64
- `app/webinars/page.tsx` — quitar redirect para visitantes
- `app/membresia/page.tsx` — mostrar banner bienvenida si `?bienvenida=true`
- `components/Navbar.tsx` — actualizar hrefs
- `components/Footer.tsx` — actualizar hrefs
- `app/sitemap.ts` — agregar nuevas rutas

## Verificación

1. Navegar a `/auth/login` → debe redirigir 301 a `/iniciar-sesion`
2. El comprobante se puede subir aunque Cloudflare no esté configurado (fallback base64)
3. Registrar cuenta nueva → llega a `/membresia?bienvenida=true` con banner
4. Como visitante, `/webinars` muestra la lista pero requiere login para entrar
5. Cada rol ve correctamente su dashboard
6. Todas las páginas públicas tienen Navbar + Footer