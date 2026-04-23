---
name: "Landing Content Integration"
overview: "Integrate all content sections from academia_credito_landing.html into the existing homepage (app/page.tsx), adapting the dark navy/gold theme to the platform's light theme with purple accents (#5A4FCF), using Tailwind + framer-motion to match existing component patterns."
todos:
  - id: "hero-rewrite"
    content: "Rewrite components/Hero.tsx with landing hero content (badge, title, subtitle, feature card with price) adapted to platform colors and style"
    status: not_started
  - id: "foryou"
    content: "Create components/ForYou.tsx with 9-item grid of 'Esta academia es para ti si...' situations"
    status: not_started
  - id: "video-intro"
    content: "Create components/VideoIntro.tsx with video placeholder section"
    status: not_started
  - id: "whatyouget"
    content: "Create components/WhatYouGet.tsx with session/module cards and numbered results list"
    status: not_started
  - id: "about-rami"
    content: "Create components/AboutRami.tsx with bio, stats grid, photo placeholder and quote block"
    status: not_started
  - id: "testimonials"
    content: "Create components/Testimonials.tsx with 6-card testimonial grid (placeholders)"
    status: not_started
  - id: "cta-banner"
    content: "Create components/CtaBanner.tsx with CTA section linking to /planes"
    status: not_started
  - id: "page-assembly"
    content: "Update app/page.tsx to import and mount all new sections in correct order"
    status: not_started
createdAt: "2026-04-23T18:09:34.349Z"
updatedAt: "2026-04-23T18:09:34.349Z"
---

# Integrar Landing de Academia Credito al Homepage

## Color Mapping

| Landing (dark/gold)         | Plataforma (light/purple)     |
|-----------------------------|-------------------------------|
| `#C9A84C` (gold accent)     | `#5A4FCF` (purple accent)     |
| `#0B1F3A` (navy)            | `#1A1A2E` (dark text/cards)   |
| `#060F1C` (dark bg)         | `#F4F4F7` (light bg)          |
| gold borders                | `border-gray-100` / `border-indigo-100` |
| dark card bg                | `bg-white` with shadows       |

## Estructura del Homepage Resultante

1. **Navbar** (existente, sin cambios)
2. **Hero** -- Reescribir `components/Hero.tsx` con el contenido de la landing (titulo "Domina el sistema de credito en Estados Unidos", subtitulo, badge, hero card con features y precio)
3. **ForYou** -- Nuevo `components/ForYou.tsx` -- grid de 9 items "Esta academia es para ti si..."
4. **VideoIntro** -- Nuevo `components/VideoIntro.tsx` -- placeholder para video introductorio
5. **WhatYouGet** -- Nuevo `components/WhatYouGet.tsx` -- 2 cards (Sesiones en Vivo, Modulos) + lista de resultados
6. **Features** (existente, sin cambios)
7. **TrustedBy** (existente, sin cambios)
8. **AboutRami** -- Nuevo `components/AboutRami.tsx` -- bio, stats, foto placeholder, quote
9. **Testimonials** -- Nuevo `components/Testimonials.tsx` -- grid de 6 testimonios placeholder
10. **CtaBanner** -- Nuevo `components/CtaBanner.tsx` -- CTA con precio y boton que enlaza a `/planes`
11. **Cursos** section (existente en page.tsx, sin cambios)
12. **Footer** (existente, sin cambios)

## Archivos a Modificar

- `components/Hero.tsx` -- Reemplazar contenido con hero de la landing, adaptado al estilo visual actual (rounded-[3.5rem], framer-motion, Tailwind). Mantener el hero card con features a la derecha.
- `app/page.tsx` -- Importar y montar las nuevas secciones en orden.

## Archivos a Crear

- `components/ForYou.tsx` -- Grid de situaciones, estilo card blanca con bordes.
- `components/VideoIntro.tsx` -- Placeholder video 16:9 con borde y CTA visual.
- `components/WhatYouGet.tsx` -- Dos cards + lista numerada de resultados.
- `components/AboutRami.tsx` -- Grid de 2 columnas: foto placeholder + bio + stats + quote.
- `components/Testimonials.tsx` -- Grid 3 columnas de cards de testimonios placeholder.
- `components/CtaBanner.tsx` -- CTA final con precio y Link a `/planes`.

## Patron a Seguir

MUST seguir el patron de componentes existentes:
- `"use client"` + `framer-motion` para animaciones (`motion.div`, `whileHover`, `initial/animate`)
- Tailwind con `rounded-[2.5rem]`/`rounded-[3.5rem]`, `bg-white`, `border border-gray-100`
- Color accent: `text-[#5A4FCF]`, `bg-indigo-50`
- Dark text: `text-[#1A1A2E]`
- Labels: `text-[10px] font-black uppercase tracking-widest`
- Icons de `lucide-react`

MUST NOT cambiar Navbar, Footer, PlanesClient, ni otros componentes existentes.
MUST NOT introducir CSS personalizado en globals.css.

## Verificacion

1. Ejecutar `npm run dev` y navegar a `/` para verificar que todas las secciones se renderizan correctamente.
2. Verificar responsividad en mobile (las grids deben colapsar a 1 columna).
3. Verificar que el boton CTA enlaza a `/planes`.
