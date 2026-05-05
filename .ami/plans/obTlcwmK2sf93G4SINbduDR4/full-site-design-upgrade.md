---
name: "Full Site Design Upgrade"
overview: "Comprehensive design upgrade across all public routes and the dashboard applying the \"Confianza y Autoridad Financiera\" aesthetic: distinctive Fraunces serif headings + DM Sans body, stronger typography hierarchy, consistent design token usage (fixing all hardcoded hex colors), improved motion, and corrected branding text throughout."
todos:
  - id: "foundation"
    content: "Update app/layout.tsx (Fraunces + DM Sans fonts) and app/globals.css (font utilities, grain texture, token additions)"
    status: not_started
  - id: "shared-components"
    content: "Improve Navbar.tsx and Footer.tsx with new typography and better structure"
    status: not_started
  - id: "hero"
    content: "Major redesign of components/Hero.tsx — editorial layout, serif heading, floating stat cards"
    status: not_started
  - id: "home-sections"
    content: "Improve ForYou.tsx, WhatYouGet.tsx, AboutRami.tsx, Testimonials.tsx, and CtaBanner.tsx"
    status: not_started
  - id: "public-routes"
    content: "Update PublicCoursesClient.tsx, MembresiaClient.tsx, nosotros/page.tsx, not-found.tsx — fix tokens + branding"
    status: not_started
  - id: "auth-checkout"
    content: "Standardize auth pages (login, signup) and checkout/success with design tokens, fix off-brand copy"
    status: not_started
  - id: "dashboard"
    content: "Minor refinements to DashboardHeader.tsx, Sidebar.tsx, dashboard/page.tsx for typography consistency"
    status: not_started
createdAt: "2026-05-05T00:52:17.477Z"
updatedAt: "2026-05-05T00:52:17.478Z"
---

# Full Site Design Upgrade — Confianza y Autoridad Financiera

## Aesthetic Direction
- **Tone**: Financial authority — premium but approachable, editorial, trustworthy
- **Fonts**: `Fraunces` (serif display, beautiful italic) for headings + `DM Sans` (geometric, clean) for body — replacing Plus Jakarta Sans
- **Colors**: Keep existing brand palette (#0B1F3A navy, #C9A84C gold) but standardize via CSS tokens everywhere
- **Motion**: Intentional staggered reveals, editorial hover states
- **Differentiation**: Dramatic serif/sans contrast + aggressive tracking on labels + editorial layout rhythm

---

## Phase 1 — Foundation

### `app/layout.tsx`
Import `Fraunces` + `DM_Sans` from `next/font/google` as CSS variables `--font-display` and `--font-sans`. Remove `Plus_Jakarta_Sans`.

### `app/globals.css`
- Add `@layer base { .font-display { font-family: var(--font-display); } }`
- Add subtle SVG noise grain overlay utility class
- Add `--shadow-card`, `--shadow-glow` tokens
- Body default: `font-family: var(--font-sans)`

---

## Phase 2 — Shared Components

### `components/Navbar.tsx`
- Apply `font-display` to logo text area
- Tighten spacing, improve active state indicator weight
- No structural changes needed — already solid

### `components/Footer.tsx`
- Make more substantial: add tagline, mission statement, nav links section
- Better typographic hierarchy with `font-display` for brand name

---

## Phase 3 — Home Page Components (all 8 targeted)

### `components/Hero.tsx`
Major redesign:
- **Left**: Dramatic serif headline with italic accent + features list
- **Right**: Replace current card with floating metric/trust indicators (editorial stat cards)
- Add diagonal accent line element
- CTA buttons: more visual weight, refined hover

### `components/ForYou.tsx`
- Replace `X` icon with numbered editorial markers (01–09)
- Grid layout: keep but improve card depth with subtle hover elevation
- Better heading typography with `font-display`

### `components/WhatYouGet.tsx`
- Feature cards: add icon upgrade + better visual separation
- Results list: editorial numbered format — large `font-display italic` numbers in accent color
- More dramatic heading

### `components/AboutRami.tsx`
- Magazine-style layout: large pull quote treatment
- Stats: horizontal bar with decorative elements
- Better quote card with large typographic quotation mark

### `components/Testimonials.tsx`
- Large opening quotation mark (decorative, `font-display`)
- Better avatar initials design
- Subtle card background variation for depth

### `components/CtaBanner.tsx`
- More dramatic — full-width dark section with noise texture
- Price displayed more prominently
- Add urgency micro-copy

---

## Phase 4 — Public Routes

### `app/cursos/PublicCoursesClient.tsx`
- Replace ALL hardcoded `#C9A84C`, `#0B1F3A`, `gray-*` → design tokens
- Better page header with `font-display` title
- Improve filter pills design consistency

### `app/membresia/MembresiaClient.tsx`
- Improve pricing card typography (serif price number)
- Better section header

### `app/nosotros/page.tsx`
- Fix branding: remove "Falcón", "Artica Group", "élite digital de Falcón" text
- Update to Academia Credito USA-appropriate copy
- Better team card design
- Replace hardcoded colors with tokens

### `app/not-found.tsx`
- Fix: remove "Articademy", "metaverso", "Articademy en Miami" references
- Update to ACU branding
- Replace hardcoded colors → tokens

---

## Phase 5 — Auth & Checkout

### `app/auth/login/page.tsx`
- Replace ALL hardcoded `#C9A84C`, `#0B1F3A` → design tokens (`text-accent`, `bg-navy`, `bg-foreground`, etc.)
- Better visual hierarchy, refined input states

### `app/auth/signup/page.tsx`
- Same token standardization + refine form layout
- Fix off-brand copy ("nueva generación de creadores en Falcón")

### `app/checkout/success/page.tsx`
- Minor refinement: better success animation, serif heading

---

## Phase 6 — Dashboard

### `app/dashboard/DashboardHeader.tsx`
- Apply `font-display` to page title
- Minor visual refinements

### `app/dashboard/Sidebar.tsx`
- Minor refinement: improve active state, section label typography
- No structural changes

### `app/dashboard/page.tsx`
- Better stat card typography using `font-display` for large numbers
- No functional changes

---

## Critical Rules
- MUST use design tokens (`text-accent`, `bg-navy`, `bg-foreground`, `text-muted`, `border-card-border`) everywhere — zero hardcoded hex colors
- MUST import framer-motion using `m` from `"framer-motion"` (existing pattern in `components/Hero.tsx:2`)
- MUST NOT change any data fetching, API logic, or component interfaces
- MUST NOT change dashboard admin functionality — visual improvements only
- MUST follow `"use client"` placement pattern from existing files
