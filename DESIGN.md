# Design

Visual system for Reliance HVS. Two surfaces share one language: the public Home Value Site (brand register, themable per brokerage) and the brokerage console (product register, Reliance branded).

## Scene

Homeowner: a Sunday morning on the couch, phone in hand, daylight through the window, following a link from a postcard. Light theme, pure white, unhurried.

Operator: a marketing director at a laptop mid-morning, console open next to a CRM. Light theme, restrained, dense where data needs it.

## Color

OKLCH throughout. Strategy: Restrained for the console, Committed for the public site where the brokerage color carries CTAs, the value gauge, and one drenched section.

### Platform (Reliance) palette

| Token | Value | Role |
|---|---|---|
| `--rl-bg` | `oklch(1 0 0)` | page |
| `--rl-surface` | `oklch(0.975 0.002 110)` | sidebar, panels |
| `--rl-ink` | `oklch(0.17 0.005 110)` | body text |
| `--rl-muted` | `oklch(0.47 0.01 110)` | secondary text, ≥4.5:1 |
| `--rl-line` | `oklch(0.90 0.004 110)` | hairlines |
| `--rl-primary` | `oklch(0.46 0.10 112)` | deep olive, primary actions, white text |
| `--rl-primary-soft` | `oklch(0.95 0.03 112)` | selected/hover wash |
| `--rl-accent` | `oklch(0.55 0.14 250)` | links, embed channel color |

### Tenant (brokerage) theme tokens

Each brokerage supplies a small set of tokens that the public pages consume. Defaults for the demo tenant "Harbor & Vale":

| Token | Default | Role |
|---|---|---|
| `--t-brand` | `oklch(0.42 0.10 200)` | deep teal: CTAs, gauge fill, links |
| `--t-brand-ink` | `oklch(1 0 0)` | text on brand |
| `--t-brand-soft` | `oklch(0.95 0.025 200)` | washes, chips |
| `--t-ink` | `oklch(0.15 0 0)` | body text |
| `--t-muted` | `oklch(0.45 0 0)` | secondary text |
| `--t-bg` | `oklch(1 0 0)` | page |
| `--t-dark` | `oklch(0.20 0 0)` | drenched dark sections |
| `--t-radius` | `20px` | control and card radius (12 to 24 allowed) |

Alternate demo tenants: "Keystone Group" (brick `oklch(0.50 0.17 28)`, radius 10px) and "Summit Realty" (indigo `oklch(0.45 0.16 280)`, radius 16px).

### Data viz

Categorical order (fixed, never cycled): blue `#2a78d6`, orange `#eb6834`, aqua `#1baf7a`, yellow `#eda100`. Sequential: blue ramp. Emphasis: brand hue plus gray `oklch(0.85 0 0)`. Status: good `#0ca30c`, warning `#fab219`, critical `#d03b3b`, always with an icon or label.

## Typography

One family: Hanken Grotesk (variable, weights 300 to 700) via Google Fonts, with `system-ui` fallback. Optical sizing on. Numbers in tables use tabular figures; hero figures use proportional figures.

Public site scale (fluid): display `clamp(2.75rem, 1.5rem + 5vw, 5.5rem)` weight 600 tracking -0.03em; hero figure `clamp(3.5rem, 2rem + 7vw, 6rem)` weight 300 tracking -0.03em; h2 `clamp(2rem, 1.25rem + 2.5vw, 3.25rem)` weight 600 tracking -0.02em; lead `1.25rem`; body `1.0625rem` line-height 1.6; caption `0.875rem`.

Console scale (fixed rem, ratio 1.2): page title `1.5rem` weight 600; section `1.125rem` weight 600; body `0.9375rem`; label `0.8125rem`; table `0.875rem` tabular.

## Layout

Public: content column max 1120px, hero copy max 20ch, prose max 65ch. Section rhythm alternates generous (`clamp(5rem, 10vw, 9rem)`) vertical padding with tight internal groups (0.75 to 1.5rem). One full-bleed dark section and one full-bleed photo section per page. Sticky segmented section nav on the report.

Console: 240px sidebar on a tinted surface, content max 1280px, 24px gutters, 4pt spacing scale. Grid for page structure, flex for rows.

## Components

- Buttons: pill for public CTAs (height 52px, brand fill, white text); 36px radius-8 in console (olive fill or hairline outline). Visible focus ring `0 0 0 3px` brand at 35%.
- Address search: 64px pill input with leading pin icon and embedded submit; results list attached below with keyboard selection.
- Range gauge: 8px track with soft fill, brand marker for the estimate, hairline markers for sources.
- Stat tile (console): label, value semibold, signed delta with direction, optional sparkline.
- Section nav (report): pill segments, active segment filled with ink.
- Chips: soft brand wash, 999px radius, 0.875rem.

## Motion

Public: one orchestrated hero entrance (headline rises 12px with fade, 600ms, ease-out-quint, staggered 80ms), hero figure counts up 900ms, sections enhance on scroll with a 10px rise (content visible by default). Console: 150 to 200ms state transitions only, no page choreography. All motion has a reduced-motion alternative (crossfade or none).

## Depth

Shadows only on floating elements (search results, preview frame): `0 1px 2px oklch(0 0 0 / 6%), 0 8px 24px oklch(0 0 0 / 8%)`. Cards in the console use a hairline border and no shadow.
