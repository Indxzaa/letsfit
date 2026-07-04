# LetsFit Design System

> Always read this file before writing or modifying any UI code.

## Philosophy: Neobrutalism

LetsFit uses a **neobrutalist** design language — raw, bold, and confident. The style communicates strength and energy, which matches a fitness application.

Core principles:
- **Thick solid borders** — 3–4px, always black (`#111111` light / `#EBEBDF` dark)
- **Hard offset shadows** — no blur, offset only (e.g. `4px 4px 0 #111`)
- **Sharp corners** — `border-radius: 0` by default. Small radius (8–16px) is applied sparingly via inline styles.
- **Flat colors** — no gradients, no glassmorphism, no blur on cards
- **Bold typography** — display font (Archivo Black) for all headings, uppercase for labels
- **High readability** — never use faded text for important content (see rule below)

---

## Critical Readability Rule

**Never use low-opacity text (`rgba < 0.8`) for important UI content.**

- Titles, names, headings → solid white or `text-app` (100% opacity)
- Body text → minimum `rgba(255,255,255,0.85)` on dark backgrounds
- Secondary labels → minimum `rgba(255,255,255,0.65)` on dark, `text-muted` on light
- Decorative/hint text only → can go down to `rgba(255,255,255,0.55)`
- World colors used as accents only — never reduce text legibility

---

## CSS Variables

All design tokens live in `app/globals.css`.

### Core Palette

```css
--neo-black:       #111111        /* borders, shadows, text (light mode) */
--neo-white:       #FFFFFF        /* card backgrounds */
--neo-cream:       #F5F0E5        /* page background (light mode) */
--neo-surface:     #F0EFE9        /* slightly off-white surface */
--neo-page-bg:     var(--neo-cream)
```

### Accent Colors

```css
--neo-accent:      #16A34A        /* primary green */
--neo-accent-dark: #15803D        /* hover state */
--neo-green:       #16A34A
--neo-blue:        #2563EB
--neo-purple:      #7C3AED
--neo-amber:       #D97706
--neo-red:         #DC2626
--neo-yellow:      #FACC15
```

### Card Background Tints (light/dark aware)

```css
--card-bg-green:   #DCFCE7  /* dark: #0F2B1A */
--card-bg-amber:   #FEF3C7  /* dark: #261C05 */
--card-bg-purple:  #EDE9FE  /* dark: #1F0E35 */
--card-bg-blue:    #DBEAFE  /* dark: #0E1F38 */
```

### Border & Shadow Tokens

```css
--neo-border:      3px solid #111111
--neo-border-2:    2px solid #111111
--neo-shadow:      4px 4px 0 #111111
--neo-shadow-lg:   6px 6px 0 #111111
--neo-shadow-sm:   2px 2px 0 #111111
```

In dark mode (`[data-theme="dark"]`), `--neo-black` becomes `#EBEBDF` and all border/shadow tokens update automatically.

---

## Typography

| Use | Font | Class | Notes |
|---|---|---|---|
| Headings | Archivo Black | `font-display` | Uppercase, letter-spacing -0.01em |
| Body | Space Grotesk | (default body) | 1.125rem, line-height 1.6 |
| Labels | Archivo Black | `font-display text-xs uppercase tracking-widest` | 10–12px |
| Monospace | JetBrains Mono | `font-mono` | Code, stats |

### Scale used in practice

| Role | Class |
|---|---|
| Hero heading | `font-display text-5xl sm:text-6xl font-bold text-app uppercase` |
| Page title | `font-display text-4xl font-bold text-app uppercase` |
| Section title | `font-display text-2xl font-bold text-app` |
| Card title | `font-display text-xl font-bold text-app` |
| Label | `text-[10px] font-bold uppercase tracking-widest` |
| Body | `text-sm text-muted leading-relaxed` |

---

## Utility Classes

### Cards

```tsx
// Standard card (white bg, neo border+shadow)
<div className="neo-card p-6" style={{ borderRadius: 0 }}>

// Override card bg with a tinted surface
<div className="neo-card p-5" style={{ background: 'var(--card-bg-green)', borderRadius: 16 }}>

// Accent card (green bg, white text)
<div className="neo-card-accent p-6" style={{ borderRadius: 0 }}>

// Cream card
<div className="neo-card-cream p-6" style={{ borderRadius: 0 }}>
```

Note: `neo-card` applies border + shadow only. Background is always overridden inline.

### Buttons

```tsx
// Primary neo button (uppercase, hard shadow)
<button className="neo-btn neo-btn-primary">ACTION</button>

// Black button
<button className="neo-btn neo-btn-black">ACTION</button>

// Ghost button
<button className="neo-btn neo-btn-ghost">action</button>

// Inline custom button (used in adventure/boss)
<button style={{
  background: '#22c55e',
  border: '3px solid #000',
  boxShadow: '4px 4px 0 #000',
  color: '#fff',
}}>Start</button>
```

### Badge

```tsx
<div className="neo-badge">Label</div>
// → green bg, white text, Archivo Black, uppercase, 2px border
```

### Input

```tsx
<input className="neo-input" />
// → white bg, 3px border, no radius, shadow on focus
```

### Navigation links

```tsx
<Link className="link-back">← Back</Link>     // muted, animated hover
<Link className="link-cta">Go →</Link>         // accent color, underline
```

### Page shell pattern

```tsx
<div className="min-h-screen page-bg">
  <Navbar />
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
    {/* content */}
  </div>
</div>
```

---

## Animations

### Hover / Press (Framer Motion)

Standard spring used across all interactive cards and buttons:

```tsx
<motion.div
  whileHover={{ y: -4 }}
  whileTap={{ y: 2, scale: 0.985 }}
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
>
```

### Entry animations

```tsx
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.35 }}
```

Staggered children (delay: `index * 0.05`):

```tsx
transition={{ duration: 0.3, delay: i * 0.05 }}
```

### Reduced motion

Always respect user preference:

```tsx
import { useReducedMotion } from 'framer-motion';
const reduced = useReducedMotion();
if (reduced) return null; // or simplify animation
```

---

## Spacing System

| Token | Value | Usage |
|---|---|---|
| xs | 0.25rem (4px) | Gap between inline elements |
| sm | 0.5rem (8px) | Tight internal padding |
| md | 1rem (16px) | Standard card padding |
| lg | 1.5rem (24px) | Section gaps |
| xl | 2rem (32px) | Between major sections |

Card padding: `p-5` (20px) or `p-6` (24px) or `p-8` (32px) for hero cards.

---

## Color System: World Themes

Each Adventure world has a primary color used for borders, shadows, accents, and CTAs.

| World | Name | Primary Color | Hex |
|---|---|---|---|
| 1 | Forest Realm | Green | `#7ecf8a` (in-world) / `#22c55e` (UI) |
| 2 | Winter Kingdom | Blue | `#7cc4e8` |
| 3 | Witch Coven | Purple | `#b870dc` |
| 4 | Elven Sanctuary | Amber/Gold | `#e8c050` |

World colors are accessed via `WORLD_THEMES[world].primary` from `lib/worlds.ts`.

Boss tier colors are accessed via `TIER_CONFIG[boss.tier].color` from `lib/bosses.ts`.

World colors should be used for:
- Section headers and badges
- Card borders and shadows
- CTA buttons (as background)
- Icons and highlights

World colors must NOT reduce text readability.

---

## Dark Mode

Dark mode is activated by `document.documentElement.setAttribute('data-theme', 'dark')`.

Managed by `components/ThemeProvider.tsx` — use `useTheme()` to read/set mode.

The neo-card variables (`--neo-black`, `--neo-border`, `--neo-shadow`) automatically invert in dark mode. The `page-bg` class always uses the correct background.

---

## Component Checklist

Before shipping any UI component, verify:

- [ ] No `backdrop-filter: blur()` (glassmorphism)
- [ ] No gradient backgrounds on cards
- [ ] No `border-radius > 16px` (keep it sharp)
- [ ] No `box-shadow` with blur (hard offset only)
- [ ] No low-opacity text on important content
- [ ] All interactive elements have hover + press states
- [ ] Light mode and dark mode both look correct
- [ ] Responsive on mobile (375px) and desktop (1280px)
- [ ] `npm run build` passes with no TypeScript errors
