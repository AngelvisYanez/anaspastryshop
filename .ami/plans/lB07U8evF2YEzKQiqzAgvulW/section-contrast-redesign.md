---
name: "Section Contrast Redesign"
overview: "Alternate section backgrounds to create visual rhythm and depth throughout the landing page, with proper dark/light mode contrast using existing CSS tokens."
todos:
  - id: "foryou-bg"
    content: "ForYou: convert to full-bleed bg-section-alt with inner max-w container"
    status: not_started
  - id: "whatyouget-inverted"
    content: "WhatYouGet: full-bleed bg-foreground inverted section, fix text colors outside cards"
    status: not_started
  - id: "aboutrami-bg"
    content: "AboutRami: convert to full-bleed bg-section-alt with inner max-w container"
    status: not_started
  - id: "ctabanner-darkmode"
    content: "CtaBanner: fix dark mode — bg-navy dark:bg-card, fix hardcoded text colors"
    status: not_started
  - id: "page-cleanup"
    content: "page.tsx: adjust CoursesCarousel inline section padding to match new rhythm"
    status: not_started
createdAt: "2026-05-04T22:24:37.042Z"
updatedAt: "2026-05-04T22:24:37.043Z"
---

# Section Contrast Redesign

## Current Problem
All sections share `bg-background` — no visual distinction as the user scrolls. Headers already use `text-foreground` (dark in light, light in dark) correctly, but sections look flat.

## CSS Token Reference
| Token | Light | Dark |
|---|---|---|
| `bg-background` | `#F8F4EE` cream | `#060F1C` deep navy |
| `bg-section-alt` | `#F0EBD8` warm tan | `#0B1F3A` navy |
| `bg-foreground` | `#0B1F3A` dark navy | `#F0EAD6` cream |
| `text-background` | `#F8F4EE` cream | `#060F1C` dark |
| `bg-card` | `#ffffff` | `#0D1B2E` dark card |

`bg-foreground` + `text-background` = **perfect auto-inverting pattern**: dark in light mode, light in dark mode — exactly what was requested.

## Section Rhythm (after changes)
| Section | Background | Effect |
|---|---|---|
| Hero | `bg-card` (keep) | Card on cream/dark |
| **ForYou** | `bg-section-alt` full-bleed | Warm tan / navy |
| VideoIntro | `bg-background` (keep) | Plain, breather |
| **WhatYouGet** | `bg-foreground` full-bleed | **Inverted**: dark navy in light / cream in dark |
| CoursesCarousel | `bg-background` (keep) | Plain |
| **AboutRami** | `bg-section-alt` full-bleed | Warm tan / navy |
| Testimonials | `bg-background` (keep) | Plain |
| **CtaBanner** | `bg-navy dark:bg-card` (fix) | Stays dark in both modes |

## Files to Modify

### `components/ForYou.tsx`
- `<section>` gets `w-full bg-section-alt py-24`
- Content wrapped in `max-w-7xl mx-auto px-4 md:px-10`

### `components/WhatYouGet.tsx` (inverted)
- `<section>` gets `w-full bg-foreground py-24`
- Content wrapped in `max-w-7xl mx-auto px-4 md:px-10`
- Section label stays `text-accent` ✓
- `h2` changes from `text-foreground` → `text-background`
- Outside-card body text (`text-muted` in the numbered list) → `text-background/65`
- `border-card-border` in numbered list → `border-background/15`
- Internal `bg-card` cards stay as-is (white/dark-card pops on inverted bg ✓)

### `components/AboutRami.tsx`
- `<section>` gets `w-full bg-section-alt py-24`
- Content wrapped in `max-w-7xl mx-auto px-4 md:px-10`

### `components/CtaBanner.tsx`
- Fix dark mode: `bg-navy` → `bg-navy dark:bg-card` (stays dark both modes)
- `text-white` stays, `text-gray-400` → `text-white/60`, `text-gray-500` → `text-white/40`

### `app/page.tsx`
- Remove `px-4 md:px-10 max-w-7xl mx-auto` from the CoursesCarousel inline `<section>` (it controls its own padding now that neighbors are full-bleed)
- No structural reordering needed — current order is logical
