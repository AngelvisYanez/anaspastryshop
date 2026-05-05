---
name: "Dashboard UX Improvements"
overview: "Mejoras de UI/UX para el dashboard en 5 áreas prioritarias: consistencia del design system (dark mode), accesibilidad, rendimiento de queries, carga diferida de charts, y correcciones de layout/UX menores."
todos:
  - id: "fix-dark-mode"
    content: "Reemplazar colores hardcoded por design tokens en PaymentCard.tsx, AllUsersView.tsx, ProfileForm.tsx y layout.tsx (pantalla suspendida)"
    status: not_started
  - id: "fix-a11y"
    content: "Agregar aria-label en botones icon-only de DashboardHeader y Sidebar; agregar role=dialog/aria-modal/aria-labelledby en los 3 modales de AllUsersView; agregar scope=col en thead"
    status: not_started
  - id: "fix-n1-queries"
    content: "Reemplazar 28 queries secuenciales en dashboard/page.tsx por 2 queries groupBy con rango de 14 dias"
    status: not_started
  - id: "lazy-charts"
    content: "Importar GrowthChart, RevenueChart, PaymentMethodsChart con next/dynamic en dashboard/page.tsx"
    status: not_started
  - id: "fix-ux-minor"
    content: "Eliminar padding duplicado en mis-cursos/page.tsx; agregar router.refresh() en PaymentCard tras aprobar/rechazar; agregar sr-only al badge de notificaciones"
    status: not_started
createdAt: "2026-05-05T00:13:15.331Z"
updatedAt: "2026-05-05T00:13:15.332Z"
---

# Plan de Mejoras UI/UX — Dashboard

## Diagnóstico por área

### 1. Inconsistencia del Design System (dark mode roto)
Varios componentes usan colores hardcodeados en lugar de los tokens del design system, rompiendo el dark mode.

**Archivos afectados:**
- `app/dashboard/pagos/PaymentCard.tsx` — `bg-white`, `bg-gray-50`, `text-[#0B1F3A]`
- `app/dashboard/usuarios/AllUsersView.tsx` — tabla, KPIs y modales con hardcoded
- `app/dashboard/settings/ProfileForm.tsx` — `bg-white`, colores navy/gold hardcoded
- `app/dashboard/layout.tsx` — pantalla suspendida con `bg-[#F8F4EE]`, `bg-white`

**Corrección:** Reemplazar con tokens: `bg-card`, `text-foreground`, `text-muted`, `text-accent`, `border-card-border`, `bg-section-alt`.

---

### 2. Accesibilidad (WCAG 2.2)
- `DashboardHeader.tsx:77` — botón Bell sin `aria-label`; badge de notificación sin texto accesible
- `DashboardHeader.tsx:74` — botón Search sin `aria-label`
- `Sidebar.tsx:129` — botón collapse/expand usa `title` pero no `aria-label`
- `AllUsersView.tsx` — modales sin `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; `<th>` sin `scope="col"`

**Corrección:** Agregar `aria-label` en todos los botones icon-only; `role="dialog" aria-modal="true" aria-labelledby` en los 3 modales de `AllUsersView`; `scope="col"` en `<thead><tr><th>`.

---

### 3. Rendimiento — N+1 Queries
`app/dashboard/page.tsx:72-90` ejecuta **28 queries secuenciales** (14 días x 2 métricas) en lugar de queries agrupadas.

**Corrección:** Reemplazar los dos `Promise.all(last14Days.map(async (day) => ...))` por dos queries `prisma.user.groupBy` / `prisma.inscription.groupBy` filtradas al rango de 14 días, mapeando el resultado al formato de los charts.

---

### 4. Carga diferida de Charts
`app/dashboard/page.tsx:20-22` importa `GrowthChart`, `RevenueChart`, `PaymentMethodsChart` de forma síncrona. Son componentes cliente pesados con Recharts.

**Corrección:**
```ts
const GrowthChart = dynamic(() => import("./charts/GrowthChart"), { ssr: false });
const RevenueChart = dynamic(() => import("./charts/RevenueChart"), { ssr: false });
const PaymentMethodsChart = dynamic(() => import("./charts/PaymentMethodsChart"), { ssr: false });
```

---

### 5. UX menor
- `app/dashboard/mis-cursos/page.tsx:33` tiene `className="p-8"` duplicando el `p-4 md:p-8` del `<main>` en `DashboardShell.tsx:66`. MUST eliminarlo.
- `PaymentCard.tsx` no da feedback visual tras aprobar/rechazar. MUST agregar `router.refresh()` tras la accion exitosa.
- `DashboardHeader.tsx` tiene botones Search y Bell sin `aria-label`. MUST agregar `aria-label`; el badge MUST tener `<span className="sr-only">` con el texto.

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `app/dashboard/pagos/PaymentCard.tsx` | Dark mode tokens + router.refresh() post-accion |
| `app/dashboard/usuarios/AllUsersView.tsx` | Dark mode tokens + a11y modales + scope en th |
| `app/dashboard/settings/ProfileForm.tsx` | Dark mode tokens |
| `app/dashboard/layout.tsx` | Dark mode tokens en pantalla suspendida |
| `app/dashboard/page.tsx` | groupBy queries + dynamic chart imports |
| `app/dashboard/mis-cursos/page.tsx` | Eliminar padding duplicado |
| `app/dashboard/DashboardHeader.tsx` | aria-label + sr-only en badge |
| `app/dashboard/Sidebar.tsx` | aria-label en botones icon-only |

## Verificacion
- Alternar dark/light mode: todos los componentes deben adaptarse sin colores hardcoded visibles
- Navegar con Tab por sidebar y header: foco visible en todos los elementos interactivos
- Aprobar un pago en `/dashboard/pagos`: la card debe desaparecer tras la accion
