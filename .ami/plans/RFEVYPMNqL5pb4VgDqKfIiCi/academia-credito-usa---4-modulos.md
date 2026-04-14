---
name: "Academia Credito USA - 4 Modulos"
overview: "Construir 4 módulos nuevos/mejorados para la plataforma: (1) CRUD de secciones de plataforma con iconos, (2) Live Streaming con Cloudflare Stream + chat en vivo con Pusher, (3) Suscripciones simplificadas a 2 planes con control de acceso a lives, (4) Pasarela de pagos con Stripe, PayPal, Binance Pay + mejora de métodos manuales."
todos:
  - id: "schema"
    content: "Actualizar prisma/schema.prisma: agregar PlatformSection, LiveStream, ChatMessage, PaymentGatewayConfig; modificar Subscription e Inscription; ejecutar migración"
    status: not_started
  - id: "deps"
    content: "Instalar dependencias: stripe, @stripe/stripe-js, @stripe/react-stripe-js, pusher, pusher-js"
    status: not_started
  - id: "modulo1"
    content: "Módulo 1: CRUD Secciones de Plataforma - crear lib/actions/platformSections.ts, app/dashboard/modulos/page.tsx, PlatformModuleManager.tsx (con selector de iconos Lucide); actualizar Sidebar y Navbar"
    status: not_started
  - id: "modulo3"
    content: "Módulo 3: Suscripciones 2 planes - actualizar planes/page.tsx a 2 planes (ESENCIAL/PREMIUM), crear lib/actions/subscriptions.ts, dashboard/suscripciones/page.tsx"
    status: not_started
  - id: "modulo4-settings"
    content: "Módulo 4a: Configuración de gateways - crear PaymentGatewayConfig actions, GatewaySettings.tsx en dashboard/settings con campos de API key por provider (Stripe, PayPal, Binance)"
    status: not_started
  - id: "modulo4-stripe"
    content: "Módulo 4b: Integración Stripe - API routes create-checkout y webhook; conectar en CheckoutModal con botón de tarjeta"
    status: not_started
  - id: "modulo4-paypal"
    content: "Módulo 4c: Integración PayPal - API routes create-order y capture; conectar en CheckoutModal"
    status: not_started
  - id: "modulo4-binance"
    content: "Módulo 4d: Integración Binance Pay automático + mejorar métodos manuales (upload comprobante funcional)"
    status: not_started
  - id: "modulo2-api"
    content: "Módulo 2a: API de Cloudflare Stream - routes para crear/gestionar live inputs; Pusher chat API route"
    status: not_started
  - id: "modulo2-dashboard"
    content: "Módulo 2b: Dashboard de lives - dashboard/lives/page.tsx, create form con stream key display para OBS"
    status: not_started
  - id: "modulo2-public"
    content: "Módulo 2c: Páginas públicas de lives - /lives listing, /lives/[id] con player Cloudflare + chat Pusher + guard de suscripción PREMIUM"
    status: not_started
createdAt: "2026-04-14T03:01:55.878Z"
updatedAt: "2026-04-14T03:01:55.878Z"
---

# Plan: 4 Módulos Academia Crédito USA

## Contexto del Stack
- Next.js 16.1.6 + React 19, Tailwind v4, Framer Motion, Lucide React
- PostgreSQL + Prisma 6.4.1, NextAuth v5 (JWT)
- Patrones existentes: Server Actions en `lib/actions/`, CRUD en `app/dashboard/`, `CategoryManager.tsx` como referencia de CRUD simple

---

## PASO 0: Cambios al Schema (Prisma)

Todos los módulos dependen de esto. Modificar `prisma/schema.prisma`:

```prisma
// 1. Secciones navegación pública (Módulo 1)
model PlatformSection {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  icon      String   // nombre de icono Lucide (ej. "BookOpen")
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

// 2. Streaming en vivo (Módulo 2)
model LiveStream {
  id           String        @id @default(cuid())
  title        String
  description  String?
  cloudflareId String?
  streamKey    String?
  rtmpsUrl     String?
  playbackId   String?
  status       String        @default("SCHEDULED") // SCHEDULED | LIVE | ENDED
  scheduledAt  DateTime?
  instructorId String
  createdAt    DateTime      @default(now())
  instructor   User          @relation("InstructorLives", fields: [instructorId], references: [id])
  chatMessages ChatMessage[]
}

model ChatMessage {
  id        String     @id @default(cuid())
  content   String
  userId    String
  liveId    String
  createdAt DateTime   @default(now())
  user      User       @relation(fields: [userId], references: [id])
  live      LiveStream @relation(fields: [liveId], references: [id])
}

// 4. Configuración de pasarelas (Módulo 4)
model PaymentGatewayConfig {
  id            String   @id @default(cuid())
  provider      String   @unique // STRIPE | PAYPAL | BINANCE
  isEnabled     Boolean  @default(false)
  publicKey     String?
  secretKey     String?
  webhookSecret String?
  extraConfig   Json?
  updatedAt     DateTime @updatedAt
}
```

Modificar modelos existentes:
- `Subscription`: agregar `hasLiveAccess Boolean @default(false)`, `stripeSubId String?`, cambiar plan values a `"ESENCIAL"` | `"PREMIUM"`
- `Inscription`: agregar `paymentIntentId String?` (para Stripe/PayPal/Binance)
- `User`: agregar relaciones `LiveStream[]` y `ChatMessage[]`

Instalar dependencias nuevas:
```
npm install stripe @stripe/stripe-js @stripe/react-stripe-js pusher pusher-js
```

Variables de entorno a agregar al `.env`:
```
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
BINANCE_API_KEY=
BINANCE_SECRET_KEY=
```

---

## MODULO 1: CRUD Secciones de Plataforma con Iconos

Permite al admin gestionar las secciones de navegación públicas (Navbar + inicio) con nombre, slug e icono de Lucide.

**Archivos a crear:**
- `lib/actions/platformSections.ts` — server actions: `createSection`, `updateSection`, `deleteSection`, `getSections`
- `app/dashboard/modulos/page.tsx` — page server que carga secciones y renderiza el manager
- `app/dashboard/modulos/PlatformModuleManager.tsx` — client component con CRUD + selector de iconos (seguir patrón de `CategoryManager.tsx`)

**Archivos a modificar:**
- `prisma/schema.prisma` — agregar `PlatformSection`
- `app/dashboard/Sidebar.tsx` — agregar ítem `{ name: "Módulos", href: "/dashboard/modulos", icon: Layout, roles: ["ADMIN"] }`
- `components/Navbar.tsx` — leer secciones activas desde DB (via server action o fetch)

**UI del selector de iconos:** dropdown con los 20-30 iconos más usados de Lucide (BookOpen, Video, Users, etc.) como chips seleccionables.

---

## MODULO 2: Live Streaming (Cloudflare + Pusher)

**Flujo completo:**
1. Admin/Mentor crea un live → llama a Cloudflare Stream API → recibe `streamKey` + `rtmpsUrl` + `playbackId`
2. OBS se configura con esas credenciales y emite el stream
3. Usuarios con suscripción PREMIUM acceden a `/lives/[id]`
4. Chat en tiempo real vía Pusher

**Archivos API a crear:**
- `app/api/live/route.ts` — POST: `fetch('https://api.cloudflare.com/client/v4/accounts/{id}/stream/live_inputs', { method: 'POST' })` → guarda en DB
- `app/api/live/[id]/route.ts` — GET (datos del live), PATCH (cambiar status), DELETE
- `app/api/live/[id]/status/route.ts` — GET: consulta Cloudflare si el stream está activo
- `app/api/chat/route.ts` — POST: guarda mensaje en DB + dispara evento Pusher (`pusher.trigger('live-{id}', 'new-message', {...})`)

**Páginas públicas:**
- `app/lives/page.tsx` — lista de lives (SCHEDULED y LIVE), accesible para todos
- `app/lives/[id]/page.tsx` — server page que verifica suscripción PREMIUM antes de renderizar
- `app/lives/[id]/LiveWatchClient.tsx` — player Cloudflare Stream (`<Stream src={playbackId} controls />`) + chat con `pusher-js`

**Dashboard de gestión:**
- `app/dashboard/lives/page.tsx` — lista de lives del instructor/admin con status badge
- `app/dashboard/lives/create/page.tsx` + `CreateLiveForm.tsx` — formulario (título, descripción, fecha programada) → llama a `/api/live`
- `app/dashboard/lives/[id]/edit/page.tsx` — editar live + mostrar stream key + URL RTMPS para OBS

**Acceso a lives:**
- En `app/lives/[id]/page.tsx`: `const sub = await prisma.subscription.findUnique({ where: { userId } })` → si `!sub?.hasLiveAccess` redirigir a `/planes`
- Agregar en `middleware.ts`: proteger `/lives/:path*` para usuarios autenticados

**Agregar al Sidebar:** `{ name: "Gestionar Lives", href: "/dashboard/lives", icon: Radio, roles: ["ADMIN", "MENTOR"] }`

---

## MODULO 3: Suscripciones (2 Planes)

**Planes:**
- **ESENCIAL** ($29/mo): Acceso a cursos, sin lives → `hasLiveAccess: false`
- **PREMIUM** ($59/mo): Cursos + acceso a todos los lives → `hasLiveAccess: true`

**Archivos a modificar:**
- `app/planes/page.tsx` — simplificar a 2 planes, mostrar badge "LIVE incluido" en PREMIUM, conectar botón a checkout (Stripe/PayPal/manual)
- `prisma/schema.prisma` — actualizar modelo `Subscription`

**Archivos a crear:**
- `lib/actions/subscriptions.ts` — `createSubscription(userId, plan)`, `cancelSubscription(userId)`, `getUserSubscription(userId)`
- `app/dashboard/suscripciones/page.tsx` — admin ve todas las suscripciones activas con opción de gestionar
- `app/dashboard/suscripciones/SubscriptionManager.tsx` — tabla con: usuario, plan, fecha inicio/fin, hasLiveAccess, botón cancelar

**Flujo de suscripción:**
- Al pagar exitosamente (cualquier gateway) → `createSubscription()` se llama con el plan seleccionado
- El Stripe webhook y PayPal capture también llaman a `createSubscription()`

**Agregar al Sidebar:** `{ name: "Suscripciones", href: "/dashboard/suscripciones", icon: Star, roles: ["ADMIN"] }`

---

## MODULO 4: Pasarela de Pagos

### 4.1 Configuración de Gateways (Admin)

**Archivos a crear:**
- `lib/actions/gateway.ts` — `saveGatewayConfig(provider, config)`, `getGatewayConfig(provider)`, `getAllGatewayConfigs()`
- `app/dashboard/settings/GatewaySettings.tsx` — acordeón por gateway: Stripe / PayPal / Binance, cada uno con campos de API key, toggle habilitado, botón guardar

**Archivos a modificar:**
- `app/dashboard/settings/page.tsx` — agregar `<GatewaySettings />` al final de la página de settings

### 4.2 Stripe (pago automático con tarjeta)

**Archivos a crear:**
- `app/api/payments/stripe/create-checkout/route.ts` — crea Stripe Checkout Session, redirige a Stripe
- `app/api/payments/stripe/webhook/route.ts` — escucha `checkout.session.completed` → actualiza Inscription a APPROVED + llama `createSubscription()` si aplica

**Flujo:** botón en `CheckoutModal` → POST a `/api/payments/stripe/create-checkout` → redirect a `session.url` de Stripe → webhook completa la inscripción automáticamente.

### 4.3 PayPal (pago automático)

**Archivos a crear:**
- `app/api/payments/paypal/create-order/route.ts` — llama a PayPal REST v2 con fetch: `POST /v2/checkout/orders`
- `app/api/payments/paypal/capture/route.ts` — `POST /v2/checkout/orders/{id}/capture` → actualiza Inscription a APPROVED

**Flujo:** botones PayPal en `CheckoutModal` (usar `@paypal/react-paypal-js` o botón propio) → create order → capture → inscripción aprobada.

### 4.4 Binance Pay (pago automático)

**Archivos a crear:**
- `app/api/payments/binance/create-order/route.ts` — llama a Binance Pay API, retorna `qrContent` + `deeplink`
- `app/api/payments/binance/webhook/route.ts` — valida firma HMAC, actualiza Inscription a APPROVED

**Flujo:** usuario selecciona Binance Pay → se genera QR → usuario paga → webhook actualiza.

### 4.5 Métodos manuales mejorados (Zelle, Pago Móvil, USDT)

**Archivos a modificar:**
- `components/CheckoutModal.tsx`:
  - Agregar tabs/botones: Tarjeta (Stripe) | PayPal | Binance Pay | Zelle | Pago Móvil | USDT
  - Hacer funcional el upload de comprobante (usar Cloudflare R2 o simplemente `FormData` con base64 preview guardado en DB como string)
  - Los datos de cuenta (email Zelle, datos Pago Móvil, ID Binance manual) se leen de `PaymentGatewayConfig.extraConfig`

---

## Orden de Implementación

1. Schema + migraciones (base de todo)
2. Módulo 1: Secciones de plataforma (más simple, independiente)
3. Módulo 3: Suscripciones 2 planes (necesario para el control de acceso del live)
4. Módulo 4: Pasarela de pagos (Stripe → PayPal → Binance → mejora manuales)
5. Módulo 2: Live Streaming + Chat (depende de suscripciones para el guard)

## Verificación por Módulo

- **M1:** Crear sección desde `/dashboard/modulos`, verificar que aparece en Navbar público
- **M2:** Crear live, copiar stream key, conectar OBS → verificar que player muestra video, chat envía mensajes en tiempo real
- **M3:** Suscribirse a ESENCIAL → intentar entrar a un live → redirige. Suscribirse a PREMIUM → accede normalmente
- **M4:** Pagar con Stripe en modo test → verificar Inscription cambia a APPROVED automáticamente; pagar manual → admin aprueba desde `/dashboard/pagos`
