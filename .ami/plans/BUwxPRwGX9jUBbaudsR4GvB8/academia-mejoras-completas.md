---
name: "Academia Mejoras Completas"
overview: "Agregar checkout multi-paso sin registro previo, mejorar dashboard del alumno eliminando duplicados y mostrando cursos por membresía, integrar Resend para emails, corregir URL de Cloudflare Stream, y unificar todo en plan único de membresía."
todos:
  - id: "checkout-multistep"
    content: "Crear /checkout/membresia con flujo multi-paso: Paso 1 registro (si no logueado) + auto-login, Paso 2 pago con Stripe. Actualizar botones 'Quiero unirme' y cancel_url del API."
    status: not_started
  - id: "dashboard-user"
    content: "Dashboard del alumno: eliminar 'Mis Cursos' duplicado del sidebar para USER, agregar vista USER en dashboard/page.tsx con estado de subscripción y cursos, actualizar mis-cursos/page.tsx para mostrar todos los cursos si hay subscripción activa."
    status: not_started
  - id: "single-plan-access"
    content: "Simplificar lógica de acceso en cursos/[id]/page.tsx y lesson/[lessonId]/page.tsx: cualquier subscripción ACTIVE da acceso completo. Fix referencias a /planes → /membresia y /checkout/membresia. Redirect /planes → /membresia."
    status: not_started
  - id: "resend-email"
    content: "Instalar resend, crear lib/email.ts con templates y funciones, integrar en webhook Stripe (subscripción activada/cancelada, compra de curso) y en registerUser (bienvenida)."
    status: not_started
  - id: "cloudflare-url-fix"
    content: "Corregir URL de Cloudflare Stream en CloudflareVideoUploader.tsx: cambiar customer-${uid}.cloudflarestream.com/${uid}/iframe por iframe.videodelivery.net/${uid}. Agregar dominio a next.config.ts."
    status: not_started
  - id: "module-cleanups"
    content: "Mejorar página de éxito de checkout, quitar referencias multi-plan de CourseDetailClient."
    status: not_started
createdAt: "2026-05-04T22:27:52.461Z"
updatedAt: "2026-05-04T23:06:46.316Z"
---

# Plan: Academia Mejoras Completas

## Contexto Técnico Clave
- `SubscriptionPlan.moduleIds` = IDs de `PlatformSection`, no de cursos individuales
- Con un único plan de membresía activa = acceso a TODOS los cursos publicados
- Dashboard `SYSTEM_ITEMS` para USER incluye "Mis Cursos" + PlatformSections también muestran secciones → duplicado
- La sesión usa JWT; `signIn('credentials')` desde `next-auth/react` funciona para auto-login tras registro

---

## 1. Checkout Multi-paso Sin Registro Previo (Transferencia Bancaria)

El pago se hace por los métodos configurados en el plan. Por ahora: transferencia bancaria.  
El flujo es: registro → ver datos de cuenta → enviar referencia → admin aprueba → membresía activa.

### Nuevo gateway "BANK_TRANSFER" en GatewayManager

**Archivo:** `app/dashboard/metodos-pago/GatewayManager.tsx`  
Agregar al array `GATEWAYS` la definición:
```ts
{
  provider: "BANK_TRANSFER",
  label: "Transferencia Bancaria",
  description: "Transferencia bancaria americana. Los datos se muestran al usuario al pagar.",
  type: "manual",
  Icon: Building2,  // lucide-react
  color: "slate",
  fields: [
    { key: "bankName",    label: "Nombre del Banco",     placeholder: "Bank of America", extra: true },
    { key: "accountName", label: "Titular de la Cuenta", placeholder: "Academia Credito USA LLC", extra: true },
    { key: "accountNumber", label: "Número de Cuenta",   placeholder: "123456789", extra: true },
    { key: "routingNumber", label: "Routing Number (ABA)", placeholder: "021000021", extra: true },
    { key: "accountType", label: "Tipo de Cuenta",       placeholder: "Checking / Saving", extra: true },
  ],
}
```

### Nuevo API endpoint de lectura pública del gateway

**Nuevo archivo:** `app/api/gateways/[provider]/route.ts`  
`GET /api/gateways/BANK_TRANSFER` → devuelve solo `extraConfig` (datos no secretos) si el gateway está enabled.

### Nuevo server action para inscripción de membresía

**Archivo:** `lib/actions/inscription.ts`  
Agregar nueva función exportada `createSubscriptionInscription`:
- Sin requerimiento de `cursoId` → lo guarda como `null`
- Crea `Inscription` con `method: "TRANSFERENCIA"`, `status: "PENDING"`, `cursoId: null`
- No rompe la función `createInscription` existente

### Actualizar `approvePayment` para suscripciones

**Archivo:** `lib/actions/payments.ts` — función `approvePayment`:
```ts
// Después de inscription.update({ status: "APPROVED" })
const inscription = await prisma.inscription.findUnique({ where: { id: inscriptionId } });
if (!inscription?.cursoId) {
  // Es un pago de membresía → activar suscripción
  const plan = await prisma.subscriptionPlan.findFirst({ where: { isActive: true } });
  await prisma.subscription.upsert({
    where: { userId: inscription.userId },
    create: { userId: inscription.userId, plan: plan?.slug ?? "membresia", status: "ACTIVE" },
    update: { status: "ACTIVE" },
  });
  // Enviar email de confirmación de membresía
}
```

### Actualizar `PaymentCard` para suscripciones

**Archivo:** `app/dashboard/pagos/PaymentCard.tsx`  
```ts
const itemTitle = inscription.curso?.title ?? "Membresía Academia";
const expectedPrice = inscription.curso?.price ?? inscription.amountPaid;
```
Agregar badge visual diferenciador cuando `cursoId` es null: `"Tipo: Membresía"`.

### Nueva página de checkout multi-paso

**Nuevo archivo:** `app/checkout/membresia/CheckoutMembresia.tsx` (Client Component)

```
Paso 1: Cuenta     → Paso 2: Pago     → Paso 3: Confirmación
```

- Si `session` ya existe → salta directamente al Paso 2
- **Paso 1**: form name/email/password → `registerUser()` → `signIn('credentials')` → Paso 2
- **Paso 2**: 
  - Muestra datos de la cuenta bancaria (fetch `GET /api/gateways/BANK_TRANSFER`)
  - Muestra precio del plan (fetch `/api/settings/site-config`)
  - Input: Número de referencia / ID de transacción
  - Botón "Confirmar Pago" → `createSubscriptionInscription({ reference, amountPaid })`
- **Paso 3**: "¡Listo! Tu pago está en revisión. Recibirás un email cuando tu acceso sea activado." + link a `/dashboard`

**Nuevo archivo:** `app/checkout/membresia/page.tsx` (Server wrapper con `auth()` para session inicial)

### Actualizar botones "Quiero unirme"

- `app/membresia/MembresiaClient.tsx` líneas 141 y 234: cambiar `/auth/signup` → `/checkout/membresia`
- `app/api/checkout/subscription/route.ts`: mantener para Stripe futuro, actualizar `cancel_url` → `/checkout/membresia`

---

## 2. Dashboard del Alumno (USER Role)

### 2a. Eliminar duplicado de Cursos en Sidebar
**Archivo:** `app/dashboard/Sidebar.tsx`
- Eliminar `{ name: "Mis Cursos", href: "/dashboard/mis-cursos", ... roles: ["USER"] }` de SYSTEM_ITEMS
- Los PlatformSections (configura admin) manejarán el enlace a cursos

### 2b. Dashboard principal para USER
**Archivo:** `app/dashboard/page.tsx`
- Agregar rama `role === "USER"` con vista de bienvenida que muestra:
  - Card de estado de suscripción (ACTIVE/sin membresía con CTA)
  - Grid de últimos 6 cursos publicados (para subscriptores)
  - CTA "Ver todos los cursos" → `/cursos`
- Consultas adicionales: `prisma.subscription.findUnique` + `prisma.curso.findMany({ take: 6 })`

### 2c. Página Mis Cursos actualizada
**Archivo:** `app/dashboard/mis-cursos/page.tsx`
- Si tiene subscripción ACTIVA → muestra TODOS los cursos publicados de la plataforma
- Si no tiene subscripción → estado vacío + CTA "Suscribirse" → `/checkout/membresia`
- Grid igual al diseño actual con cards de cursos

---

## 3. Pago / Suscripción (Plan Único)

- `app/cursos/[id]/page.tsx`: Simplificar check de acceso → cualquier `subscription.status === "ACTIVE"` = acceso completo (eliminar distinción PREMIUM/STANDARD/BASIC)
- `app/cursos/[id]/lesson/[lessonId]/page.tsx`: Agregar verificación de subscripción activa (actualmente solo verifica `inscription`)
- `app/cursos/[id]/CourseDetailClient.tsx`: Cambiar link `/planes` → `/checkout/membresia`; quitar texto de niveles de plan (línea ~254-258)
- `app/planes/page.tsx`: Agregar `redirect('/membresia')` al inicio

---

## 4. Emails con Resend

**Requiere instalar:** `npm install resend`  
**Vars de entorno nuevas:** `RESEND_API_KEY=re_xxx`, `RESEND_FROM_EMAIL=academia@tudominio.com`

**Nuevo archivo:** `lib/email.ts`
```ts
// Funciones: sendWelcomeEmail, sendSubscriptionConfirmedEmail,
// sendSubscriptionCanceledEmail, sendCoursePurchaseEmail
// Templates HTML inline, sin librerías extra
```

**Modificar:** `app/api/webhooks/stripe/route.ts`
- Al activar subscripción → `sendSubscriptionConfirmedEmail(user.email, user.name, plan.name, amount)`
- Al cancelar subscripción → `sendSubscriptionCanceledEmail(user.email, user.name)`
- Al comprar curso → `sendCoursePurchaseEmail(user.email, user.name, curso.title)`

**Modificar:** `lib/actions/auth.ts`
- En `registerUser` tras crear usuario → `sendWelcomeEmail(email, name)` (fire-and-forget, no bloquea)

---

## 5. Cloudflare Stream (Corrección URL)

**Problema actual:** `components/CloudflareVideoUploader.tsx` genera URL incorrecta:
```ts
// INCORRECTO:
`https://customer-${uid}.cloudflarestream.com/${uid}/iframe`
// CORRECTO:
`https://iframe.videodelivery.net/${uid}`
```

**Modificar:** `components/CloudflareVideoUploader.tsx` línea 62  
**Modificar:** `next.config.ts` — agregar `iframe.videodelivery.net` a `remotePatterns`

---

## 6. Mejoras Menores

- `app/checkout/success/page.tsx`: Mejorar UX con datos más completos y link a `/cursos`
- `app/dashboard/page.tsx` header: quitar emoji del saludo para usuarios ADMIN/MENTOR

---

## Variables de Entorno Nuevas

```env
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=academia@tudominio.com
```

Cloudflare Stream ya tiene: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`

---

## Archivos Modificados (resumen)

| Archivo | Acción |
|---------|--------|
| `app/checkout/membresia/page.tsx` | CREAR |
| `app/checkout/membresia/CheckoutMembresia.tsx` | CREAR |
| `app/api/gateways/[provider]/route.ts` | CREAR |
| `lib/email.ts` | CREAR |
| `app/dashboard/metodos-pago/GatewayManager.tsx` | Agregar gateway BANK_TRANSFER |
| `app/dashboard/Sidebar.tsx` | Eliminar "Mis Cursos" de USER SYSTEM_ITEMS |
| `app/dashboard/page.tsx` | Agregar vista USER con sub status + cursos |
| `app/dashboard/mis-cursos/page.tsx` | Mostrar todos los cursos si hay subscripción activa |
| `app/dashboard/pagos/PaymentCard.tsx` | Mostrar "Membresía" para pagos sin cursoId |
| `lib/actions/inscription.ts` | Agregar `createSubscriptionInscription` |
| `lib/actions/payments.ts` | `approvePayment` activa Subscription + email |
| `lib/actions/auth.ts` | Agregar welcome email |
| `app/cursos/[id]/page.tsx` | Simplificar acceso con subscripción activa |
| `app/cursos/[id]/lesson/[lessonId]/page.tsx` | Agregar check subscripción |
| `app/cursos/[id]/CourseDetailClient.tsx` | Fix links + quitar texto multi-plan |
| `app/planes/page.tsx` | Redirect a /membresia |
| `app/membresia/MembresiaClient.tsx` | Botones → /checkout/membresia |
| `components/CloudflareVideoUploader.tsx` | Fix URL Cloudflare Stream |
| `next.config.ts` | Agregar iframe.videodelivery.net |
| `app/checkout/success/page.tsx` | Mejorar UX |

---

## Verificación

1. Admin configura banco en `/dashboard/metodos-pago` → gateway BANK_TRANSFER con datos de cuenta
2. Usuario va a `/membresia` → click "Quiero unirme" → `/checkout/membresia` sin login previo
3. Paso 1: registra cuenta → auto-login → Paso 2
4. Paso 2: ve los datos bancarios y envía referencia → Paso 3 (confirmación en revisión)
5. Admin ve el pago en `/dashboard/pagos` con badge "Membresía" → aprueba → Subscription activa + email llega al usuario
6. Usuario con membresía ACTIVE accede a todos los cursos y lecciones sin restricción de nivel
7. Sidebar del alumno muestra UN solo enlace de cursos (sin duplicado)
8. Dashboard USER muestra estado de membresía y cursos disponibles
9. Subir video en dashboard → URL correcta `iframe.videodelivery.net/{uid}`
10. `/planes` redirige a `/membresia`