# Design System Reference

Source of truth for design tokens in this project. The tokens are defined in Figma (file: Property-Management) and mirrored here so coding agents can wire them into Tailwind without opening Figma.

**Golden rule:** if a value isn't in this file, it isn't in the system. Don't invent new tokens — add them to Figma first, then update this doc.

---

## Overview

- **Font:** Geist (only font family in use)
- **Colour model:** Light only — dark mode is deferred
- **Spacing base:** 4px grid (Tailwind default)
- **Token naming:** Tailwind conventions — CSS variables map to Tailwind utility classes

### Token collections in Figma

| Collection | Purpose |
|---|---|
| `Primitives` | Raw hex colours. Hidden from pickers — use semantic tokens instead. |
| `Color` | Semantic colour aliases (`bg`, `fg`, `border`, `success`, `danger`, `info`). |
| `Typography` | Font size, weight, family, line-height tokens. |
| `Spacing` | 4px-based spacing scale. |
| `Radius` | Corner radius scale. |

---

## How to use (Tailwind v4)

Tailwind v4 uses **CSS-first configuration** via the `@theme` directive. There is NO `tailwind.config.js` — all tokens live in `app/globals.css`. Every token you declare inside `@theme` is automatically wired up as a Tailwind utility class (e.g. `--color-background` becomes `bg-background`, `--text-base` becomes `text-base`).

Replace the contents of `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  /* Colour — semantic */
  --color-background: #ffffff;
  --color-muted: #fafafa;
  --color-subtle: #f5f5f5;
  --color-inverse: #1f1f1f;
  --color-foreground: #1f1f1f;
  --color-muted-foreground: #525252;
  --color-subtle-foreground: #808080;
  --color-disabled: #999999;
  --color-inverse-foreground: #ffffff;
  --color-border: #e5e5e5;
  --color-border-strong: #d6d6d6;
  --color-ring: #007ef2;
  --color-success: #009707;
  --color-success-soft: #dafade;
  --color-success-foreground: #006f00;
  --color-danger: #ef3456;
  --color-danger-soft: #ffeaec;
  --color-danger-foreground: #b51d3d;
  --color-info: #007ef2;
  --color-info-soft: #dee9ff;
  --color-info-foreground: #005db4;

  /* Typography */
  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;

  /* Font sizes — IMPORTANT: this OVERRIDES Tailwind's defaults.
     text-base = 14px (not 16), text-sm = 13px (not 14).
     Each pairs with a line-height via --tw-leading-*. */
  --text-xs: 12px;
  --text-xs--line-height: 1.3;
  --text-sm: 13px;
  --text-sm--line-height: 1.5;
  --text-base: 14px;
  --text-base--line-height: 1.5;
  --text-md: 16px;
  --text-md--line-height: 1.3;
  --text-lg: 18px;
  --text-lg--line-height: 1.3;
  --text-2xl: 24px;
  --text-2xl--line-height: 1.2;

  --font-weight-normal: 400;
  --font-weight-medium: 500;

  --leading-tight: 1.2;
  --leading-snug: 1.3;
  --leading-normal: 1.5;

  /* Spacing — extends Tailwind's default 4px scale */
  --spacing-0: 0;
  --spacing-0_5: 2px;
  --spacing-1: 4px;
  --spacing-1_5: 6px;
  --spacing-2: 8px;
  --spacing-2_5: 10px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;

  /* Radius */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 6px 0 rgb(0 0 0 / 0.06);
}

/* Optional: explicitly apply Geist via next/font. The className on <body>
   is typically set in app/layout.tsx from next/font — no extra CSS needed. */
```

**Key v4 notes for coding agents:**

- There is no `tailwind.config.js` in a v4 project. If you see one, delete it and move tokens into `@theme` in `app/globals.css`.
- The `@import "tailwindcss";` replaces v3's separate `@tailwind base; @tailwind components; @tailwind utilities;`.
- Token naming matters: `--color-*` creates `bg-*`/`text-*`/`border-*` utilities; `--text-*` creates `text-<name>` font-size utilities; `--spacing-*` creates `p-*`/`m-*`/`gap-*`/`w-*`/`h-*`. Follow this naming exactly or utilities won't be generated.
- Content paths are auto-detected in v4 — no `content: [...]` array needed.
- Dark mode is NOT set up (Phase 0 is light only). If needed later, add `@variant dark (&:where(.dark, .dark *))` inside the stylesheet.

---

## Colour

### Semantic tokens — use these in code

| Figma variable | Tailwind class | CSS variable | Hex | Use for |
|---|---|---|---|---|
| `bg/base` | `bg-background` | `--color-background` | `#ffffff` | Cards, panels, modals |
| `bg/muted` | `bg-muted` | `--color-muted` | `#fafafa` | Page background |
| `bg/subtle` | `bg-subtle` | `--color-subtle` | `#f5f5f5` | Hover states, section headers, table header rows |
| `bg/inverse` | `bg-inverse` | `--color-inverse` | `#1f1f1f` | Dark UI blocks, inverted toasts |
| `fg/default` | `text-foreground` | `--color-foreground` | `#1f1f1f` | Primary body text, headings |
| `fg/muted` | `text-muted-foreground` | `--color-muted-foreground` | `#525252` | Secondary text, supporting copy |
| `fg/subtle` | `text-subtle-foreground` | `--color-subtle-foreground` | `#808080` | Tertiary text, metadata, table labels |
| `fg/disabled` | `text-disabled` | `--color-disabled` | `#999999` | Disabled text |
| `fg/inverse` | `text-inverse-foreground` | `--color-inverse-foreground` | `#ffffff` | Text on dark backgrounds |
| `border/default` | `border-border` | `--color-border` | `#e5e5e5` | Default borders, dividers |
| `border/strong` | `border-border-strong` | `--color-border-strong` | `#d6d6d6` | Emphasised borders |
| `ring/focus` | `ring-ring` | `--color-ring` | `#007ef2` | Keyboard focus rings |
| `success/solid` | `bg-success` | `--color-success` | `#009707` | Success solid fills |
| `success/bg` | `bg-success-soft` | `--color-success-soft` | `#dafade` | Success tag / pill background |
| `success/fg` | `text-success-foreground` | `--color-success-foreground` | `#006f00` | Success tag text |
| `danger/solid` | `bg-danger` | `--color-danger` | `#ef3456` | Danger/emergency solid fills |
| `danger/bg` | `bg-danger-soft` | `--color-danger-soft` | `#ffeaec` | Emergency / failed tag background |
| `danger/fg` | `text-danger-foreground` | `--color-danger-foreground` | `#b51d3d` | Emergency / failed tag text |
| `info/solid` | `bg-info` | `--color-info` | `#007ef2` | Info solid fills, links |
| `info/bg` | `bg-info-soft` | `--color-info-soft` | `#dee9ff` | Info tag background |
| `info/fg` | `text-info-foreground` | `--color-info-foreground` | `#005db4` | Info tag text |

### Primitive colour scale — for reference only

Don't use primitives directly in application code. They exist so semantic tokens can alias them. If you need a shade that isn't covered by a semantic token, raise it — don't reach for a primitive.

**Neutrals**

| Token | Hex |
|---|---|
| `white` | `#ffffff` |
| `neutral/50` | `#fafafa` |
| `neutral/100` | `#f5f5f5` |
| `neutral/150` | `#ebebeb` |
| `neutral/200` | `#e5e5e5` |
| `neutral/300` | `#d6d6d6` |
| `neutral/400` | `#cccccc` |
| `neutral/500` | `#999999` |
| `neutral/600` | `#808080` |
| `neutral/700` | `#525252` |
| `neutral/800` | `#3d3d3d` |
| `neutral/900` | `#1f1f1f` |
| `neutral/950` | `#141414` |
| `black` | `#000000` |

**Accents**

| Token | Hex |
|---|---|
| `blue/50` | `#f7fcff` |
| `blue/100` | `#dee9ff` |
| `blue/500` | `#007ef2` |
| `blue/700` | `#005db4` |
| `green/100` | `#dafade` |
| `green/600` | `#009707` |
| `green/700` | `#006f00` |
| `red/100` | `#ffeaec` |
| `red/500` | `#ef3456` |
| `red/700` | `#b51d3d` |

---

## Typography

### Font family

Only **Geist** is used. Loaded in `Regular` (400) and `Medium` (500). Tailwind class: `font-sans`.

### Font size

**IMPORTANT:** This scale overrides Tailwind's defaults. `text-base` is **14px** (not 16). `text-sm` is **13px** (not 14). If you see `text-base` in this repo, it means 14px.

| Tailwind class | Figma variable | px | Typical use |
|---|---|---|---|
| `text-xs` | `text/xs` | 12 | Captions, metadata, table cells |
| `text-sm` | `text/sm` | 13 | Small labels, dense UI |
| `text-base` | `text/base` | 14 | Body text, menu items, default |
| `text-md` | `text/md` | 16 | Large body, form inputs |
| `text-lg` | `text/lg` | 18 | Section headings |
| `text-2xl` | `text/2xl` | 24 | Page titles, display numbers |

### Font weight

| Tailwind class | Figma variable | Value |
|---|---|---|
| `font-normal` | `weight/normal` | 400 |
| `font-medium` | `weight/medium` | 500 |

### Line height

Percentage ratios (multiplied by font-size at render time).

| Tailwind class | Figma variable | Ratio |
|---|---|---|
| `leading-tight` | `leading/tight` | 1.2 (120%) |
| `leading-snug` | `leading/snug` | 1.3 (130%) |
| `leading-normal` | `leading/normal` | 1.5 (150%) |

### Text styles (ready-made ramps in Figma)

For consistency, prefer these named text styles over assembling your own font-size + weight + line-height combination.

| Figma style | Font size | Weight | Line-height | Tailwind equivalent |
|---|---|---|---|---|
| `text/display` | 24 | Medium | 1.2 | `text-2xl font-medium leading-tight` |
| `text/heading` | 18 | Medium | 1.3 | `text-lg font-medium leading-snug` |
| `text/subheading` | 16 | Medium | 1.3 | `text-md font-medium leading-snug` |
| `text/body` | 14 | Regular | 1.5 | `text-base font-normal leading-normal` |
| `text/body-strong` | 14 | Medium | 1.5 | `text-base font-medium leading-normal` |
| `text/small` | 13 | Regular | 1.5 | `text-sm font-normal leading-normal` |
| `text/caption` | 12 | Regular | 1.3 | `text-xs font-normal leading-snug` |

---

## Spacing

4px base unit, matching Tailwind's default scale indices.

| Tailwind class | Figma variable | px |
|---|---|---|
| `p-0`, `m-0`, `gap-0` | `space/0` | 0 |
| `p-0.5` | `space/0-5` | 2 |
| `p-1` | `space/1` | 4 |
| `p-1.5` | `space/1-5` | 6 |
| `p-2` | `space/2` | 8 |
| `p-2.5` | `space/2-5` | 10 |
| `p-3` | `space/3` | 12 |
| `p-4` | `space/4` | 16 |
| `p-5` | `space/5` | 20 |
| `p-6` | `space/6` | 24 |
| `p-8` | `space/8` | 32 |

Use for `p-*`, `m-*`, `gap-*`, `w-*`, `h-*`, and arbitrary sizing.

---

## Radius

| Tailwind class | Figma variable | px | Use for |
|---|---|---|---|
| `rounded-none` | `radius/none` | 0 | Square corners |
| `rounded-sm` | `radius/sm` | 4 | Most UI elements (default) |
| `rounded-md` | `radius/md` | 10 | Cards, panels, buttons |
| `rounded-lg` | `radius/lg` | 12 | Larger surfaces |
| `rounded-full` | `radius/full` | 9999 | Pills, avatars, circular icons |

---

## Effects

### Shadow

One shadow token is defined as a Figma effect style, exposed as `--shadow-sm` in `@theme` (see "How to use" section).

| Figma style | Tailwind class | CSS |
|---|---|---|
| `Card Shadow` | `shadow-sm` | `box-shadow: 0 1px 6px 0 rgb(0 0 0 / 0.06)` |

---

## What's NOT in the system yet

Don't invent these — raise with the designer if you need them.

- **Dark mode** — deferred. Only `Light` mode exists on the `Color` collection.
- **Component variables** — existing Figma components (`Menu Item`, `Tag`, `Checkbox`, `Issue / Default`, `Main Container`) still use hardcoded values. Migration to the new tokens is a follow-up.
- **Motion / animation tokens** — no duration, easing, or transition tokens defined.
- **Elevation scale** — only the single `Card Shadow` exists. No scale of elevations.
- **Icon colour tokens** — icons are monochrome components. They should adopt `text-foreground` / `text-muted-foreground` when used; no dedicated icon tokens exist.
- **Opacity / alpha tokens** — not defined. If you need a semi-transparent state, use Tailwind's `opacity-*` utilities against a solid token.
- **Wider colour ramps** — only the shades above are defined (`neutral/50…950`, `blue/50…700`, etc.). If you need `blue/300` or `red/900`, add it to Figma Primitives first and surface it here.
- **Breakpoint tokens** — the designs are desktop-only at 1716px. No responsive breakpoints defined.

---

## Changelog

- **2026-04-19** — Migrated "How to use" section to Tailwind v4 (CSS-first `@theme` config, no `tailwind.config.js`). Token values unchanged.
- **2026-04-18** — Initial foundation. 5 collections, 73 variables, 7 text styles, 1 effect style.
