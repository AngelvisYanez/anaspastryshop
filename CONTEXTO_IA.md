# CONTEXTO COMPLETO DEL PROYECTO: ARTICADEMY
> Documento de referencia para agentes de IA. Última actualización: 2026-04-09.
> Este archivo describe la arquitectura, lógica de negocio, estructura de archivos, modelos de datos y convenciones del proyecto para que cualquier agente pueda trabajar en él sin contexto previo.

---

## 1. DESCRIPCIÓN GENERAL

**Nombre del proyecto:** ARTICADEMY (anteriormente "Artica Media Academy")
**Tipo:** Plataforma educativa fullstack con sistema de membresías, pagos manuales y control de roles.
**Stack tecnológico:**
- **Frontend/Backend:** Next.js 16.1.6 (App Router, React 19)
- **Base de Datos:** SQLite (via Prisma 6.4.1, en desarrollo)
- **ORM:** Prisma Client 6.4.1
- **Autenticación:** NextAuth v5 (beta) con estrategia JWT + Credentials Provider
- **Estilos:** Tailwind CSS v4
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Gráficos Dashboard:** Recharts
- **Adaptador de Auth:** @auth/prisma-adapter

---

## 2. ESTRUCTURA DE DIRECTORIOS

```
artica-media-academy/
├── app/                        # Next.js App Router (páginas y rutas)
│   ├── layout.tsx              # Layout raíz de la app
│   ├── page.tsx                # Página de inicio (landing page pública)
│   ├── globals.css             # Estilos globales
│   ├── api/
│   │   ├── auth/               # Endpoints de NextAuth
│   │   ├── seed-admin/         # Endpoint para crear usuario admin inicial
│   │   └── talleres/           # Endpoints API para talleres
│   ├── auth/
│   │   ├── login/              # Página de inicio de sesión
│   │   └── register/           # Página de registro de usuarios
│   ├── cursos/
│   │   ├── page.tsx            # Listado público de cursos (Server Component)
│   │   ├── PublicCoursesClient.tsx  # Filtros de cursos (Client Component)
│   │   └── [id]/               # Detalle público de un curso específico
│   ├── talleres/
│   │   ├── page.tsx            # Listado público de talleres con filtros (Server Component)
│   │   └── [id]/               # Detalle público de un taller específico
│   ├── planes/
│   │   └── page.tsx            # Página de membresías/suscripciones (Client Component)
│   ├── clases/                 # Módulo de clases en vivo
│   ├── pasantias/              # Página de pasantías
│   ├── nosotros/               # Página "Nosotros"
│   └── dashboard/              # Panel administrativo protegido
│       ├── layout.tsx          # Layout del dashboard con auth + validación real-time de isActive
│       ├── page.tsx            # Página principal del dashboard (stats, gráficos)
│       ├── DashboardShell.tsx  # Contenedor principal (Sidebar + Header + Main)
│       ├── DashboardHeader.tsx # Cabecera del panel
│       ├── Sidebar.tsx         # Barra lateral con navegación y logo
│       ├── DynamicAgenda.tsx   # Agenda dinámica del dashboard
│       ├── cursos/             # CRUD de cursos (Admin/Mentor)
│       │   ├── page.tsx        # Listado de cursos propios
│       │   ├── CourseActions.tsx
│       │   ├── create/         # Formulario de creación de curso
│       │   └── [id]/           # Edición de curso (módulos, lecciones)
│       ├── talleres/           # CRUD de talleres (Admin/Mentor)
│       │   ├── page.tsx        # Listado de talleres
│       │   ├── TallerActions.tsx
│       │   ├── create/         # Formulario de creación de taller
│       │   └── [id]/           # Edición de taller (módulos, temas)
│       ├── pagos/              # Validación de pagos (ADMIN only)
│       ├── usuarios/           # Gestión de usuarios (Admin/Mentor)
│       ├── categorias/         # CRUD de categorías (ADMIN)
│       ├── logs/               # Auditoría de actividad (ADMIN)
│       ├── settings/           # Configuración de perfil del usuario
│       │   ├── page.tsx
│       │   └── ProfileForm.tsx # Formulario de perfil con carga de foto en Base64
│       ├── mentores/           # Gestión de mentores
│       └── charts/             # Componentes de gráficos para el dashboard
├── components/                 # Componentes reutilizables globales
│   ├── Navbar.tsx              # Navegación principal pública
│   ├── Footer.tsx              # Pie de página
│   ├── Hero.tsx                # Sección hero de la landing
│   ├── Features.tsx            # Sección de características
│   ├── TrustedBy.tsx           # Sección de confianza/partners
│   ├── CourseCard.tsx          # Tarjeta de curso reutilizable
│   ├── CheckoutModal.tsx       # Modal de pago/inscripción
│   ├── Providers.tsx           # SessionProvider de NextAuth
│   └── RealTimeGuard.tsx       # Componente de verificación de sesión en tiempo real
├── lib/
│   ├── auth.ts                 # Configuración de NextAuth
│   ├── prisma.ts               # Instancia singleton de PrismaClient
│   ├── logger.ts               # Sistema de logging de actividad
│   └── actions/                # Server Actions (mutaciones de datos)
│       ├── auth.ts             # Registro de usuarios
│       ├── categorias.ts       # CRUD de categorías
│       ├── cursos.ts           # CRUD completo de cursos + módulos + lecciones
│       ├── inscription.ts      # Inscripciones de usuarios
│       ├── mentores.ts         # Gestión de mentores
│       ├── payments.ts         # Validación de pagos por admin
│       ├── talleres.ts         # CRUD completo de talleres + módulos + temas
│       └── user.ts             # CRUD de usuarios (perfil, imagen, activación)
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   ├── seed.ts                 # Script de seed inicial
│   ├── dev.db                  # Base de datos SQLite (desarrollo)
│   └── dev.db.bak              # Respaldo de la base de datos
├── public/
│   ├── logo.png                # Logo principal
│   ├── logo.webp               # Logo webp
│   ├── logo_II.png             # Logo variante II (en uso activo en Sidebar + Navbar)
│   ├── logo_II.webp            # Logo variante II en webp (PREFERIDO, en uso)
│   └── LOGO ARTICA ACADEMY.png # Logo oficial con texto
├── types/                      # Tipos TypeScript globales
├── middleware.ts               # Protección de rutas (/dashboard) con NextAuth
├── prisma.config.ts            # Configuración de conexión para Prisma 7 compatibility
├── next.config.ts              # Configuración Next.js
├── INICIO_RAPIDO.md            # Comandos de inicio rápido
├── GESTION_PUERTOS.md          # Cómo liberar puertos y reiniciar el servidor
├── FLUJO_BASE_DATOS.md         # Diagrama ERD y flujos de negocio
└── CONTEXTO_IA.md              # Este archivo
```

---

## 3. MODELOS DE BASE DE DATOS (Prisma Schema)

### User (Usuarios)
```
id, name, email, password, role (USER|MENTOR|ADMIN), isApproved, isActive,
deactivationReason, image (Base64 string), createdAt, updatedAt
Relaciones: cursos, talleres, inscripciones, subscription, activities
```

### Subscription (Suscripciones/Membresías)
```
id, userId, plan (BASIC|STANDARD|PREMIUM), status (ACTIVE|EXPIRED),
startDate, endDate
Relación: user (1:1)
```
- **BASIC (Plan Esencial):** Acceso solo a cursos nivel "Principiante"
- **STANDARD (Plan Profesional):** Acceso a "Principiante" + "Intermedio"
- **PREMIUM (Plan Elite):** Acceso completo a todo el catálogo

### Taller (Talleres)
```
id, title, description, category, price, date, time, location, isOnline,
slots, image, agenda, includes, duration, language, level, instructorId, createdAt
Relaciones: inscritos (Inscription[]), instructor (User), modules (TallerModule[])
```

### TallerModule (Módulos de Taller)
```
id, title, order, tallerId, createdAt
Relaciones: taller, topics (TallerTopic[])
```

### TallerTopic (Temas de Módulo de Taller)
```
id, title, summary, order, tallerModuleId, createdAt
Relación: tallerModule
```

### Curso (Cursos)
```
id, title, description, image, introVideo, price, category (default:"General"),
totalHours, totalClasses, language, level, content, isLive, liveUrl, instructorId, createdAt
Relaciones: courseModules (CourseModule[]), instructor (User), inscritos (Inscription[])
```
> **Niveles de Curso:** "Principiante", "Intermedio", "Avanzado"

### CourseModule (Módulos de Curso)
```
id, title, videoUrl, order, cursoId, createdAt
Relaciones: curso, lessons (Lesson[])
```

### Lesson (Lecciones)
```
id, title, summary, order, courseModuleId, createdAt
Relación: courseModule
```

### Inscription (Inscripciones / Pagos Únicos)
```
id, status (PENDING|APPROVED|REJECTED), method (Zelle|USDT|BCV|Pago Móvil),
reference, phoneNumber, receiptImage (Base64), amountPaid, userId, tallerId?,
cursoId?, createdAt, updatedAt
Relaciones: user, taller?, curso?
```

### Category (Categorías)
```
id, name (unique), createdAt
```

### ActivityLog (Auditoría)
```
id, action, entityType, entityId, details, userId, createdAt
Relación: user
```

---

## 4. SISTEMA DE ROLES Y PERMISOS

| Rol | Acceso |
|---|---|
| `USER` | Dashboard de alumno: Mis Cursos, Configuración. No puede acceder a módulos de gestión. |
| `MENTOR` | Gestionar Talleres, Gestionar Cursos, Usuarios, Configuración. **Bloqueado completamente si no tiene foto de perfil (excepto Configuración).** |
| `ADMIN` | Acceso completo: todo lo de MENTOR + Validar Pagos, Categorías, Auditoría, Usuarios. |

### Bloqueo de Mentor sin Foto
Si `session.user.role === "MENTOR"` y `session.user.image` es null/vacío, el `DashboardShell` recibe `isBlockedMentor=true` y el Sidebar solo muestra el módulo de "Configuración". El Header también muestra una alerta en rojo (animada) indicando "Acceso restringido: Sube tu foto".

---

## 5. AUTENTICACIÓN Y SEGURIDAD

### Archivo: `lib/auth.ts`
- Usa **NextAuth v5** con **Credentials Provider** (email + password con bcrypt).
- Estrategia **JWT** para transportar `role`, `id`, `isApproved`, `isActive` en el token.
- **IMPORTANTE:** La consulta a la base de datos fue eliminada del callback `jwt` para evitar el error de Edge Runtime. La validación en tiempo real de `isActive` ahora se realiza en el `layout.tsx` del dashboard.

### Archivo: `middleware.ts`
- Protege todas las rutas que empiecen por `/dashboard`.  
- Redirige usuarios no autenticados a `/auth/login`.
- Bloquea acceso a `/dashboard/pagos` si el rol no es `ADMIN`.
- **LIMITACIÓN:** No puede usar Prisma directamente (Edge Runtime no compatible con SQLite).

### Archivo: `app/dashboard/layout.tsx`
- Aquí se realiza la **validación real-time de cuenta activa** consultando la BD con Prisma.  
- Si `dbUser.isActive === false`, el usuario ve la pantalla de "Cuenta Desactivada" con el motivo.
- Detecta si el mentor tiene foto de perfil para activar el modo `isBlockedMentor`.

### Archivo: `prisma.config.ts`
- Creado para compatibilidad con Prisma 7. Desplaza la URL de conexión fuera del `schema.prisma`.
- La propiedad `url` en `datasource db` del schema está comentada.

---

## 6. PÁGINAS PÚBLICAS

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `app/page.tsx` | Landing page con Hero, Features, TrustedBy |
| `/cursos` | `app/cursos/page.tsx` | Listado de cursos con filtros (Server + Client) |
| `/cursos/[id]` | `app/cursos/[id]/` | Detalle de curso. Requiere registro para comprar. |
| `/talleres` | `app/talleres/page.tsx` | Listado de talleres con filtros |
| `/talleres/[id]` | `app/talleres/[id]/` | Detalle de taller |
| `/planes` | `app/planes/page.tsx` | Planes de suscripción: Esencial ($29), Profesional ($49), Elite ($79) |
| `/nosotros` | `app/nosotros/` | Página institucional |
| `/pasantias` | `app/pasantias/` | Información sobre pasantías |

### Sistema de Filtros (Cursos y Talleres)
Ambos módulos públicos tienen **filtros sincronizados** que incluyen:
1. **Buscador de texto** (por título)
2. **Botones de nivel** (Todos / Principiante / Intermedio / Avanzado)
3. **Icono de filtro** (toggle que despliega selector de categorías)
El filtrado es en tiempo real en el cliente usando `framer-motion` para las transiciones.

---

## 7. MÓDULOS DEL DASHBOARD

### Dashboard Principal (`/dashboard`)
- Estadísticas: Total cursos, total talleres, ingresos, inscripciones.
- Gráfico de ingresos (`RevenueChart.tsx`) y crecimiento (`GrowthChart.tsx`) usando Recharts.
- Agenda dinámica (`DynamicAgenda.tsx`).
- Secciones: Últimas inscripciones, cursos y talleres recientes.

### Gestionar Cursos (`/dashboard/cursos`)
- Listado de cursos del instructor actual.
- Crear: formulario con campos completos (título, descripción, precio, nivel, imagen en Base64, video intro, módulos y lecciones anidados).
- Editar: Gestión de módulos y lecciones con operaciones CRUD inline.
- Publicar/archivar cursos.

### Gestionar Talleres (`/dashboard/talleres`)
- Similar a cursos pero con campos específicos de talleres (fecha, horario, lugar, cupos).
- Los talleres tienen Módulos → Temas (equivalente a Módulos → Lecciones en cursos).
- La visualización del contenido del taller en la página pública incluye módulos y temas.

### Validar Pagos (`/dashboard/pagos`) — Solo ADMIN
- Lista de inscripciones con estado PENDING.
- El admin puede aprobar o rechazar pagos.
- Se muestra: comprobante de pago (imagen Base64), referencia, monto, método y usuario.

### Usuarios (`/dashboard/usuarios`)
- Lista de todos los usuarios del sistema.
- El admin puede activar/desactivar cuentas con un motivo.
- El admin puede ver y editar roles.

### Categorías (`/dashboard/categorias`) — Solo ADMIN
- CRUD simple de categorías de cursos/talleres.

### Auditoría (`/dashboard/logs`) — Solo ADMIN
- Registro de todas las actividades del sistema (quién hizo qué y cuándo).
- Implementado via `lib/logger.ts`.

### Configuración (`/dashboard/settings`)
- Formulario de perfil del usuario: nombre, email, contraseña.
- **Carga de foto de perfil:** Se guarda como string Base64 en `user.image`.
- Esta es la única sección accesible para Mentores bloqueados.

---

## 8. SERVER ACTIONS (`lib/actions/`)

Los Server Actions son la capa de mutación de datos del proyecto. Todos usan `"use server"` y validan permisos internamente.

| Archivo | Funciones principales |
|---|---|
| `auth.ts` | `registerUser()` — registro de nuevos alumnos |
| `categorias.ts` | `createCategory()`, `deleteCategory()` |
| `cursos.ts` | `createCurso()`, `updateCurso()`, `deleteCurso()`, `addModule()`, `updateModule()`, `deleteModule()`, `addLesson()`, `updateLesson()`, `deleteLesson()` |
| `talleres.ts` | `createTaller()`, `updateTaller()`, `deleteTaller()`, operaciones sobre módulos y temas |
| `inscription.ts` | `createInscription()` — crea la inscripción (pago) |
| `payments.ts` | `approvePayment()`, `rejectPayment()` — solo ADMIN |
| `mentores.ts` | Aprobación/gestión de mentores |
| `user.ts` | `updateProfile()`, `updateProfileImage()`, `deactivateUser()`, `activateUser()` |

---

## 9. COMPONENTES GLOBALES IMPORTANTES

### `Navbar.tsx`
- Navegación pública responsiva con animación Framer Motion.
- Usa `useSession()` para mostrar avatar/menú del usuario si está logueado.
- Links: Cursos, Talleres, Membresías, Pasantías, Nosotros.
- Logo: `logo_II.webp` con filtro `brightness-0` para efecto de color negro uniforme.

### `CheckoutModal.tsx`
- Modal complejo de compra/inscripción.
- Muestra detalles del curso/taller y permite ingresar datos del pago (método, referencia, imagen).
- Para cursos: ofrece opción de pago individual o ir a planes de suscripción.
- Para talleres: solo pago individual (los talleres **no** están incluidos en suscripciones).

### `RealTimeGuard.tsx`
- Componente cliente que verifica la sesión periódicamente.
- Si detecta que la cuenta fue desactivada, fuerza el cierre de sesión automáticamente.

### `Providers.tsx`
- Envuelve la app con `SessionProvider` de NextAuth.

---

## 10. LAYOUT DEL DASHBOARD

### `DashboardShell.tsx`
- Contenedor principal que implementa el diseño de "doble scroll":
  - **`h-screen overflow-hidden`** en el contenedor raíz.
  - **Sidebar** se mantiene fijo (estático en desktop, `fixed` en mobile).
  - **Área de contenido** es el único que tiene `overflow-y-auto`.
- Maneja el estado del menú mobile (`isSidebarOpen`).

### `Sidebar.tsx`
- Logo: `logo_II.webp` con Next.js `Image`, clickeable (enlaza a `/dashboard`).
- Navegación filtrada por rol.
- Si `isBlockedMentor=true`: solo muestra "Configuración".
- Botón "Cerrar Sesión" **siempre visible** en la parte inferior (no depende del scroll del contenido gracias al layout de doble scroll).

---

## 11. CONVENCIONES Y PATRONES DEL PROYECTO

### Imports / Paths
- Alias `@/` apunta a la raíz del proyecto.
- Ejemplos: `@/lib/prisma`, `@/lib/auth`, `@/components/Navbar`.

### Patrones de Imágenes
- Imágenes de perfil y comprobantes: almacenadas como **strings Base64** en la BD.
- Imágenes de cursos/talleres: URLs (puede ser Unsplash o Base64). Configurado en `next.config.ts` para aceptar `images.unsplash.com`.

### Server vs Client Components
- Las páginas de listado que necesitan datos son Server Components (fetch en servidor).
- Los componentes con interactividad (filtros, formularios) son Client Components con `"use client"`.
- Las mutaciones van por Server Actions en `lib/actions/`.

### Paleta de Colores Principal
- **Primario Oscuro:** `#1A1A2E`
- **Acento Morado:** `#5A4FCF`
- **Fondo Gris:** `#F4F4F7`
- **Texto secundario:** `gray-400`, `gray-500`
- **Bordes:** `border-gray-100`

### Estilo de Componentes
- Bordes redondeados: `rounded-2xl` o `rounded-[3rem]` (estilo "pill" / suave).
- Sombras: `shadow-lg shadow-indigo-100`.
- Transiciones: `transition-all` en botones e interacciones.
- Animaciones de entrada: Framer Motion con `initial={{ opacity: 0, y: 20 }}` + `animate`.

---

## 12. CONFIGURACIÓN DEL ENTORNO

### `.env` (variables requeridas)
```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Comandos de Inicio
```bash
npx.cmd prisma generate     # Generar cliente de Prisma
npx.cmd prisma db push      # Sincronizar esquema con la BD
npm.cmd run dev             # Iniciar servidor de desarrollo (puerto 3000)
npx.cmd prisma studio       # Abrir Prisma Studio (puerto 5555)
```
> **NOTA:** En Windows con restricciones de PowerShell, usar `npx.cmd` y `npm.cmd` en lugar de `npx` y `npm` para evitar errores de política de ejecución.

### Resolución de Puerto Ocupado
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000, 5555 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
```

---

## 13. PROBLEMAS CONOCIDOS Y SOLUCIONES APLICADAS

### ✅ RESUELTO: Error de Edge Runtime con Prisma
**Problema:** `PrismaClient is not configured to run in Edge Runtime`  
**Causa:** Se intentaba usar Prisma en el callback `jwt` de NextAuth, que corre en el Middleware (Edge Runtime incompatible con SQLite).  
**Solución:** Se eliminó la consulta de BD del callback `jwt` y se movió la validación de `isActive` al `app/dashboard/layout.tsx` (Server Component con Node.js completo).

### ✅ RESUELTO: Diagnóstico de Prisma 7 (propiedad `url`)
**Problema:** Error de diagnóstico en VS Code: "datasource property `url` is no longer supported".  
**Causa:** La extensión de Prisma aplica reglas de v7 aunque el runtime sea v6.4.1.  
**Solución:** Se creó `prisma.config.ts` y se comentó la propiedad `url` en `schema.prisma`.

### ✅ RESUELTO: Sidebar con scroll dependiente del contenido
**Problema:** El botón de "Cerrar Sesión" solo era visible haciendo scroll al final del contenido principal.  
**Solución:** Implementación de layout "dual scroll" con `h-screen overflow-hidden` en el contenedor raíz y `overflow-y-auto` solo en el área de contenido.

### 🟡 PENDIENTE: Integración de Pasarela de Pagos Real
Los pagos actuales son **manuales**: el usuario sube un comprobante (imagen) y el admin lo aprueba manualmente. Pendiente integración con Stripe o MercadoPago.

### 🟡 PENDIENTE: Migración de imágenes Base64 a Servicio de Almacenamiento
Las fotos de perfil y comprobantes se guardan como Base64 en SQLite. Esto limita el rendimiento. Se recomienda migrar a Cloudinary o Amazon S3.

### 🟡 PENDIENTE: Middleware de Acceso por Plan de Suscripción
El modelo `Subscription` existe en la BD pero la restricción de acceso a cursos según el nivel del plan NO está implementada. Falta crear middleware o lógica en el detalle del curso que valide si el usuario tiene el plan adecuado.

### 🟡 PENDIENTE: Advertencia de `middleware.ts`
Next.js 16 muestra advertencia: *"The 'middleware' file convention is deprecated. Please use 'proxy' instead."* El archivo deberá renombrarse a `proxy.ts` en el futuro.

---

## 14. LÓGICA DE NEGOCIO

### Modelo de Venta
La plataforma tiene **dos modelos de ingreso paralelos**:

1. **Pago Único por Curso:** El alumno paga directamente por un curso. Genera un registro en `Inscription` vinculado a un `cursoId` específico.
2. **Suscripción Mensual:** El alumno paga una membresía. Genera un registro en `Subscription`. Los **talleres NO están incluidos en suscripciones**, solo los cursos.

### Flujo de Inscripción
```
Alumno ve Curso/Taller → Requiere registro → CheckoutModal →
Ingresa datos de pago (método, referencia, comprobante) →
Se crea Inscription con status="PENDING" →
Admin revisa en /dashboard/pagos →
Admin aprueba (APPROVED) o rechaza (REJECTED) →
Si APPROVED: contenido desbloqueado para el alumno
```

---

## 15. RUTAS DE API

| Ruta | Descripción |
|---|---|
| `/api/auth/[...nextauth]` | Manejador de NextAuth (login, logout, session) |
| `/api/seed-admin` | Endpoint de solo desarrollo para crear el admin inicial |
| `/api/talleres/[id]` | Operaciones de talleres vía API |
