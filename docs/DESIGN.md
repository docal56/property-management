# DESIGN.md — Buzz Design System Guide for Agents

A guide for AI agents and engineers building new screens, components, and patterns in this codebase. Follow this document so that new work feels like it was designed by the same hand as what already exists.

> **TL;DR** — Never introduce a raw hex value, a raw pixel number, or a one-off colour/size. Everything you need is already in the token layer. If a token is missing, add it to the token layer first, then use it. Compose patterns from existing primitives before inventing new components.

> **Component catalogue:** the live design-system showcase is served at `/components` for Buzz staff accounts only. Its route files live under `src/app/(design)/components/`; keep those demos updated when changing tokens, primitives, or patterns.

---

## Table of contents

1. [Core principles](#1-core-principles)
2. [The token system](#2-the-token-system)
3. [Colour — how to use it](#3-colour--how-to-use-it)
4. [Typography & information hierarchy](#4-typography--information-hierarchy)
5. [Spacing, padding & gap](#5-spacing-padding--gap)
6. [Radius, borders & shadow](#6-radius-borders--shadow)
7. [Icons](#7-icons)
8. [Layering: primitives → components → patterns → pages](#8-layering-primitives--components--patterns--pages)
9. [Page anatomy](#9-page-anatomy)
10. [Interaction states](#10-interaction-states)
11. [Accessibility baseline](#11-accessibility-baseline)
12. [Decision trees (the "which one do I pick?" shortcuts)](#12-decision-trees)
13. [House rules — what not to do](#13-house-rules--what-not-to-do)
14. [Checklist for new work](#14-checklist-for-new-work)

---

## 1. Core principles

1. **Tokens over values.** Every colour, space, radius, size, weight, and shadow is a named token declared in [app/globals.css](app/globals.css). Use `bg-primary`, `p-lg`, `rounded-md` — never `bg-[#2a5cf4]`, `p-4`, `rounded-[10px]`.
2. **Compose, don't recreate.** Before writing a new component, check [components/ui](components/ui/) (primitives) and [components/patterns](components/patterns/) (compositions). 90% of new work is recomposition.
3. **Quiet by default, loud on purpose.** The UI is near-monochrome. Colour is reserved for meaning — status, brand, and activity tone. A page with five colours is already too loud.
4. **Match the grain.** Every pattern in this repo uses the same spacing scale, the same 14px body text, the same subtle shadow, the same ghost-hover interaction. New patterns that break the grain feel foreign even when technically correct.
5. **Surface, not decoration.** Cards, panels, and rows carry content; they shouldn't announce themselves. Prefer hairline borders and `shadow-subtle` over heavy dividers, rings, or big shadows.
6. **Work in `leading-120` for controls, `leading-160` for prose.** This is the single biggest typography lever — get it right and the rest follows.

---

## 2. The token system

All tokens live in [app/globals.css](app/globals.css) under `@theme`. Tailwind v4 auto-generates utilities from these (`--color-foo` → `bg-foo`, `text-foo`, etc.).

**Two layers:**

- **Primitives** — raw values mirrored from Figma. Colour palettes (`blue-300`), spacing units (`spacing-md`), radius steps (`radius-lg`). You rarely reach for these directly.
- **Semantic tokens** — aliases that describe *intent* (`--color-primary`, `--color-foreground-muted`, `--color-border`). **These are what you should use in components.** If you find yourself typing `text-neutral-900` instead of `text-foreground-muted`, you're bypassing the system.

**Rule:** Use the semantic token whenever one exists for your intent. Only reach for a primitive when:
- You're defining a new semantic token (then consume that).
- You need an avatar-tone accent colour (`purple-100/200/300`, etc.) — these are explicitly scoped for per-event tinting and don't have single-purpose semantic aliases.

See [Semantic Tokens showcase](app/components/tokens/page.tsx) for the full table with usage notes.

---

## 3. Colour — how to use it

### 3.1 The canvas

The app has three surface tones stacked from bottom to top:

| Token | Hex | Use |
|---|---|---|
| `bg-background` | `#fafafa` (neutral-200) | The outermost canvas — the page itself, kanban column wells, table header strips. |
| `bg-surface` | `#ffffff` | Cards, panels, side sheets, inputs — anything that "sits on" the background. |
| `bg-hover` | `#f5f5f5` (neutral-300) | Transient hover on rows, ghost buttons, incoming chat bubbles. |
| `bg-selected` | `#f0f0f0` (neutral-400) | Persistent active state on rows. |

**Stacking rule:** A surface always sits on a background, never on another surface of the same tone. If you're placing a white card on white, add `bg-background` to the parent or drop the card.

### 3.2 Foreground (text + icons)

Hierarchy is carried mostly by colour, not size:

| Token | Intent | Typical use |
|---|---|---|
| `text-foreground` | Primary | Headlines, active nav, body copy that matters. |
| `text-foreground-muted` | Secondary | Supporting text, inactive nav, "description" paragraphs on cards. |
| `text-foreground-subtle` | Tertiary | Metadata, timestamps, column headers, helper text. |
| `text-foreground-placeholder` | Quaternary | Placeholder text in inputs, "Add X" empty states, disabled controls. |
| `text-foreground-inverted` | On dark | Text on `bg-primary`, `bg-destructive`, `bg-success`. |

**Rule of thumb:** Most screens use *two* foreground tones — `foreground` for the thing and `foreground-muted` for the context. Reach for `subtle` only when there's a third layer (metadata on metadata). If you need `placeholder`, you're describing absence (empty slot, disabled control, input hint).

### 3.3 Brand & action colour

- `primary` (blue-300) — exactly one affordance per screen should use this: the main call to action. Primary buttons, round send button, selected toggle, focus ring aura.
- `secondary` — white pill with a border. The second-most-common action (cancel, open panel, "View Issue").
- `ghost` — transparent until hover. Use for dense toolbars, menu buttons, and anything that mustn't compete.
- `destructive` — only for irreversible actions (delete) or urgent status. Don't use it as an accent.

### 3.4 Status colour

There are two scales — **solid** (loud) and **soft** (quiet).

| Intent | Solid (bg) | Soft (bg + text pairing) |
|---|---|---|
| Success | `bg-success` on `text-foreground-inverted` | `bg-success-soft` on `text-success-foreground` |
| Destructive / urgent | `bg-destructive` on `text-foreground-inverted` | `bg-destructive-soft` on `text-destructive-foreground` |
| Warning | `bg-warning` on `text-foreground-inverted` | `bg-warning-soft` on `text-destructive-foreground` |
| Info | `bg-info` on `text-foreground` | `bg-info-soft` on `text-info-foreground` |

**Solid** is for pills that say a strong state (Urgent, Failed, Pass). **Soft** is for longer inline banners where solid would be too loud. Never mix — don't put `text-foreground-inverted` on a soft bg.

### 3.5 Support colours (avatar tones)

`purple`, `orange`, `teal`, `pink`, `light-blue` — used in two places only:

1. **Icon-led `Avatar`** — coloured tile for a timeline/activity icon (`bg-{tone}-100 border-{tone}-200 text-{tone}-300`).
2. **Timeline events** — each event type gets one tone. The mapping is semantic (e.g. phone = purple, calendar = orange) — see [_mock-data.ts](app/(app)/_mock-data.ts) for the canonical mapping.

Do not use support colours for buttons, text, backgrounds, or anywhere else. They're scoped to event/author tinting.

### 3.6 Colour rules in one paragraph

Most of the UI is neutral. `primary` appears once per screen (the main action). Status colours only appear when something has a status. Support tones only appear on avatar-led events. If you've put more than one brand colour, one status colour, and a couple of avatar tones on a screen, you've broken the system.

---

## 4. Typography & information hierarchy

### 4.1 Font

Geist — loaded as `--font-sans`. There is no secondary typeface. Everything is Geist at one of five sizes.

### 4.2 Size scale

| Token | Size | Use |
|---|---|---|
| `text-12` | 12px | Metadata, timestamps, chip text, column headers, helper/microcopy |
| `text-13` | 13px | Table cells, dropdown option text, side-nav section labels |
| `text-14` | 14px | **Default body / controls** — buttons, nav items, inputs, labels, card content |
| `text-16` | 16px | Card headings, section titles, side-panel titles |
| `text-20` | 20px | Page headings |

**There is no `text-18`, no `text-24`, no `text-base`.** If you feel the urge to add a size, check whether you're confusing *hierarchy* with *size*. Most hierarchy comes from `text-foreground` vs `text-foreground-muted`, not from size differences.

### 4.3 Weight

| Token | Value | Use |
|---|---|---|
| `font-regular` | 400 | Body copy, prose, descriptive text |
| `font-medium` | 500 | **Default for UI** — buttons, nav, labels, card headers, emphasis |
| `font-semibold` | 600 | Page titles and the occasional standout section heading |

When in doubt, use `font-medium`. Regular is explicitly for multi-line prose.

### 4.4 Line height

- `leading-120` — single-line content: buttons, labels, nav items, titles.
- `leading-160` — multi-line content: paragraphs, chat bubble bodies, card body text.

This is *the* most common mistake in new code. A button with `leading-160` looks wrong because buttons are single-line. A paragraph with `leading-120` is painful to read.

### 4.5 Hierarchy recipe

For a content block with a title, description, and metadata:

```tsx
<div className="flex flex-col gap-base">
  <h3 className="text-14 font-medium leading-120 text-foreground">Title</h3>
  <p className="text-12 leading-160 text-foreground-muted">Description paragraph…</p>
  <span className="text-12 leading-120 text-foreground-subtle">2 days ago</span>
</div>
```

Three layers of foreground, three line-heights used deliberately, no size bumps. That's the pattern.

---

## 5. Spacing, padding & gap

### 5.1 The scale

| Token | px | Mental model |
|---|---|---|
| `xs` | 4 | "Touching" — icon ↔ text inside a chip |
| `sm` | 6 | Compact control padding (round button, small icon button) |
| `md` | 8 | Default inline gap; input and small-button padding |
| `base` | 12 | Standard padding inside a primitive; button x-padding |
| `lg` | 16 | **Card / panel inner padding**; gap between components in a stack |
| `xl` | 24 | Vertical rhythm between stacked sections on a page |
| `2xl` | 32 | Page-level gap between major regions |

### 5.2 How to choose

Most gaps inside a group are `gap-md` (8px) or `gap-base` (12px). Most padding inside a card or panel is `p-lg` (16px). Sections on a page are separated by `gap-xl` (24px). You can get 90% of the way there with just `md`, `base`, `lg`, and `xl`.

### 5.3 Canonical recipes

- **Card interior:** `p-lg` + `gap-base` between rows.
- **Button interior:** `px-base py-md` + `gap-md` between content and trailing icon.
- **Row with icon + label:** `gap-md` between icon and label.
- **Chip interior:** `px-md py-xs` + `gap-xs` icon to text.
- **Page vertical rhythm:** `gap-xl` between sections.

### 5.4 Do not

- Don't introduce `p-5`, `gap-3`, `mt-10`. There is no "5" or "3" in this scale. If a gap doesn't fit one of the tokens, you're either nesting wrong or need to adjust the layout.
- Don't use `m-*` for gap between siblings — use the parent's `gap-*`. Margins are for one-off offsets only.

---

## 6. Radius, borders & shadow

### 6.1 Radius

| Token | px | Use |
|---|---|---|
| `rounded-none` | 0 | Full-bleed |
| `rounded-sm` | 4 | Small inline elements (rarely) |
| `rounded-md` | 10 | **Default** — buttons, inputs, cards, chips |
| `rounded-lg` | 16 | Outer containers — side panels, `PageContent` top corners |
| `rounded-full` | ∞ | Pills (`Label`, `MetaChip`), avatars, round buttons |

The Main Container in [AppShell](components/patterns/app-shell.tsx) uses `rounded-t-lg` — the main content area has 16px corners at the top only, giving the page a subtle lifted feeling.

### 6.2 Borders

Three widths, applied via `border` or `border-[length:var(--border-X)]`:

- `--border-hairline` (0.5px) — subtle card outlines that pair with `shadow-subtle` (e.g. Card, BoardCard, MainNavItem active state). This signals "thing on a page" without looking clipped.
- `--border-standard` (1px) — default for inputs, dropdowns, secondary buttons.
- `--border-ring` (2px) — focus ring only, applied via `ring-2 ring-ring`.

Border colour is almost always `border-border` (neutral-500). Use `border-border-strong` only for controls that need a slightly stronger edge (the toggle's off state).

### 6.3 Shadow

| Token | Use |
|---|---|
| `shadow-subtle` | Cards sitting on a page; paired with hairline borders. |
| `shadow-default` | Elevated containers — dropdown menus, main content area, toasts. |
| `shadow-hover` | Hover/pressed state on elevated cards (BoardCard, drag overlay). |

**Rule:** Never use an arbitrary `shadow-lg` or custom box-shadow. If your surface needs more presence, ask whether it should be a `Card` (subtle + hairline) or an actual elevated element (`shadow-default`).

---

## 7. Icons

### 7.1 The `<Icon>` component

All icons go through [`<Icon name="…" size="…" />`](components/ui/icon.tsx). Icons are SVGs stored in [icons-data.ts](components/ui/icons-data.ts) with their strokes/fills normalised to `currentColor`, so they inherit `text-*` colour.

```tsx
<Icon name="search" size="md" className="text-foreground-muted" />
```

### 7.2 Size picking

| Size | px | Use |
|---|---|---|
| `xs` | 12 | Inline inside a chip (`MetaChip`) |
| `sm` | 16 | Table cells, detail rows, inside small buttons, inside dropdown options |
| `md` | 20 | **Default** — buttons, nav items, dropdown triggers, text-input leading icon |
| `lg` | 24 | Page header / large UI |
| `xl` | 32 | Avatar-scale icons |

Match the icon size to the control it sits in. A nav item uses `size="md"`. A chip uses `size="sm"`. A dropdown option uses `size="sm"` with the icon container upsized via the parent (`[&>span]:size-5`).

### 7.3 New icons

Only add an icon to [icons-data.ts](components/ui/icons-data.ts) if the concept is genuinely new. Before adding, scan the existing `IconName` union in [icon.tsx](components/ui/icon.tsx) — there are ~80 icons already.

---

## 8. Layering: primitives → components → patterns → pages

There are four layers in this codebase, and where you put new code matters:

### 8.1 Primitives — `components/ui/*`

Single-responsibility building blocks. Each one:
- Accepts `className` and forwards `ref`.
- Uses tokens only (no raw values).
- Has at most a handful of variants.
- Ships one visible shape (one button, one row, one chip).

Examples: [`Button`](components/ui/button.tsx), [`TextInput`](components/ui/text-input.tsx), [`Icon`](components/ui/icon.tsx), [`Label`](components/ui/label.tsx), [`Card`](components/ui/card.tsx), [`TableRow`](components/ui/table-row.tsx), [`Avatar`](components/ui/avatar.tsx).

**When to add a primitive:** the shape is truly new and will be reused in 3+ places. Otherwise, compose.

### 8.2 Patterns — `components/patterns/*`

Compositions of primitives that appear in multiple pages. They're where "spacing between primitives" lives.

Examples:
- [`AppShell`](components/patterns/app-shell.tsx) + [`PageContent`](components/patterns/app-shell.tsx) — top-level layout.
- [`MainNav`](components/patterns/main-nav.tsx) — sidebar with logo + grouped nav sections.
- [`PageHeaderList`](components/patterns/page-header-list.tsx) / [`PageHeaderDetail`](components/patterns/page-header-detail.tsx) — the two page header shapes.
- [`DataTable`](components/patterns/data-table.tsx) — generic typed table with filters + selection.
- [`KanbanBoard`](components/patterns/kanban-board.tsx) — drag-and-drop columns.
- [`TimelineView`](components/patterns/timeline-view.tsx), [`TranscriptView`](components/patterns/transcript-view.tsx), [`SidebarPanel`](components/patterns/sidebar-panel.tsx), [`UpdateComposer`](components/patterns/update-composer.tsx), [`CallDetailSidePanel`](components/patterns/call-detail-side-panel.tsx).

**When to add a pattern:** two or more pages need the same arrangement of primitives, or a single page has a complex, named shape (like "timeline").

### 8.3 Pages — `app/(app)/**`

Pages consume patterns. A page should mostly be data wiring + composition:

```tsx
<PageContent header={<PageHeaderList ... />}>
  {query ? <SearchHeader ... /> : null}
  <KanbanBoard ... />
</PageContent>
```

If a page file is inventing layout classes, that's a signal the pattern layer is missing something.

### 8.4 Demos & showcase — `components/patterns/_demos/*` and `app/components/*`

Every primitive and pattern has a live showcase at `/components/*`. When you add a primitive or pattern, add its variants to the corresponding showcase page so future agents can see the shape.

---

## 9. Page anatomy

Every signed-in page follows the same frame. Don't reinvent it.

```
┌──────────┬────────────────────────────────────────────────┐
│          │ PageHeader (List or Detail)                    │
│ MainNav  ├────────────────────────────────────────────────┤
│          │ Main Container (rounded-t-lg, bg-surface,      │
│  logo    │                 shadow-default, p-base)        │
│  manage  │                                                │
│   …      │   • Kanban, or                                 │
│  monitor │   • DataTable (with optional side panel), or   │
│   …      │   • TabbedContent, or                          │
│          │   • Custom detail composition                  │
└──────────┴────────────────────────────────────────────────┘
              bg-background         pr-md
```

**Rules:**
- Pages render inside [`AppShell`](components/patterns/app-shell.tsx) at `app/(app)/layout.tsx`.
- Use [`PageContent`](components/patterns/app-shell.tsx) for the right column — `variant="page"` wraps content in the elevated Main Container; `variant="detail"` leaves it flat for detail views that manage their own surface.
- The header slot is always one of [`PageHeaderList`](components/patterns/page-header-list.tsx) (icon + title + search) or [`PageHeaderDetail`](components/patterns/page-header-detail.tsx) (breadcrumb + step arrows).
- Side panels (`CallDetailSidePanel`) slide in over the Main Container from the right and are non-modal.

### 9.1 List views

Pattern: `PageHeaderList` on top, `KanbanBoard` or `DataTable` below. Optional `SearchHeader` appears when a query is active. See [`app/(app)/page.tsx`](app/(app)/page.tsx) and [`app/(app)/call-logs/page.tsx`](app/(app)/call-logs/page.tsx).

### 9.2 Detail views

Pattern: `PageHeaderDetail` on top, then a two-column layout of content + `SidebarPanel`. Use `PageContent variant="detail"`.

### 9.3 Empty, loading, error

- **Empty:** muted `text-14 text-foreground-muted` text, centered. No custom illustrations.
- **Loading:** prefer skeleton rows that match the final row shape; otherwise nothing. Don't use spinners for page content.
- **Error:** short message in `text-destructive-foreground` + a secondary button to retry.

---

## 10. Interaction states

Every interactive element has four states to cover:

| State | Expression |
|---|---|
| **Default** | Base tokens for the variant. |
| **Hover** | Darker bg (`hover:bg-hover`, `hover:bg-primary-hover`, `hover:bg-ghost-hover`). Always `transition-colors`. |
| **Focus** | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`. Always. |
| **Disabled** | `disabled:pointer-events-none disabled:opacity-40`. |

For containers with interactive children (like inputs), use `focus-within:*` variants — see [`TextInput`](components/ui/text-input.tsx).

For row selection, use the `data-selected` attribute pattern and style with `data-[selected]:bg-selected` — see [`TableRow`](components/ui/table-row.tsx), [`BoardCard`](components/ui/board-card.tsx).

**Never** use `outline` for focus. **Never** use a custom hover colour that isn't in the token set.

---

## 11. Accessibility baseline

Non-negotiables the system already carries — don't remove them when composing:

- **Focus ring** on every interactive element via `ring-ring`.
- **`aria-label`** required on every `IconButton` and `RoundButton` (TypeScript enforces this).
- **`aria-current="page"`** on active nav items.
- **`role`** on non-semantic interactive divs (e.g. `role="row"` on `TableRow`, `role="button"` on clickable `BoardCard`).
- **Keyboard:** Radix handles this for `DropdownMenu`, `Tabs`, `Toggle`, `Avatar`. For custom clickable divs, handle Enter + Space in `onKeyDown`.
- **Escape** closes overlays (`CallDetailSidePanel` does this; new overlays should too).

Touch targets should be at least 36–40px tall in practice — the default `MainNavItem` and button heights already meet this.

---

## 12. Decision trees

### Which button variant?

- **Primary** — *the* single main action of the screen (Submit, Send, Save). One per screen.
- **Secondary** — frequent secondary action (Cancel, Open, View). Can appear multiple times.
- **Ghost** — tight-space action that must not compete (toolbar buttons, "Add Media").
- **Destructive** — irreversible or dangerous (Delete, Remove).

### Which text colour?

1. Is it the main thing? → `text-foreground`.
2. Is it context/support? → `text-foreground-muted`.
3. Is it metadata (timestamp, column header)? → `text-foreground-subtle`.
4. Is it absence (placeholder, empty-state hint)? → `text-foreground-placeholder`.
5. Is it on a dark/coloured bg? → `text-foreground-inverted`.

### Solid vs soft status pill?

- One-word strong state in a table cell, card corner, inline marker → **solid** (`<LabelSmall variant="success">Pass</LabelSmall>`).
- Banner or multi-word inline status → **soft** (`bg-success-soft` + `text-success-foreground`).

### Card or Panel?

- Grouped related fields inside a page or sidebar → [`Card`](components/ui/card.tsx) (`bg-surface`, hairline, `shadow-subtle`).
- Full-region content container (a page's main body) → `PageContent` (elevated, `shadow-default`).
- Slide-in right-docked detail → [`CallDetailSidePanel`](components/patterns/call-detail-side-panel.tsx) or a new sibling pattern.

### List vs Board vs Timeline?

- Structured rows that need sort / filter / selection → [`DataTable`](components/patterns/data-table.tsx).
- Status-based columns with drag-and-drop → [`KanbanBoard`](components/patterns/kanban-board.tsx).
- Chronological activity with mixed entry types → [`TimelineView`](components/patterns/timeline-view.tsx).
- Conversation / messages → [`TranscriptView`](components/patterns/transcript-view.tsx).

### Which gap?

- Icon ↔ text in the same chip/button → `gap-xs` or `gap-md`.
- Rows in a card → `gap-base`.
- Components in a vertical stack → `gap-lg`.
- Sections in a page → `gap-xl`.

---

## 13. House rules — what not to do

1. **No raw hex.** `bg-[#f5f5f5]` is a bug. Use `bg-hover`.
2. **No arbitrary spacing.** `p-5`, `gap-3`, `mt-10` are bugs. Use the token scale.
3. **No new text sizes.** Stick to the five sizes. Hierarchy is carried by colour.
4. **No custom shadows.** `shadow-[0_4px_8px_rgba(0,0,0,0.1)]` is a bug. Use `shadow-subtle`/`shadow-default`/`shadow-hover`.
5. **No re-skinning Radix primitives with new colours.** Follow the wrapper pattern in [`components/ui`](components/ui/) — Radix handles behaviour, our wrapper handles style.
6. **No primary colour for decoration.** `bg-primary` means "this is the main action". Don't use it for headers, dividers, or accents.
7. **No support colours outside avatar-led contexts.** `bg-purple-100` on a random banner is a bug.
8. **No inline colour styles.** `style={{ color: '#1f1f1f' }}` is a bug. Use `text-foreground`.
9. **No duplicated primitives.** If you find yourself writing a second `Button`, you've already gone wrong — extend the existing one.
10. **Don't skip the showcase.** A new primitive or pattern without a `/components/*` demo is invisible to the next agent.
11. **Don't leak data types into primitives.** Primitives take `ReactNode` children and style props — they don't know about `Issue`, `Call`, or any domain type. Domain mapping lives in the page or a pattern.
12. **Don't reach across layers.** A primitive must not import a pattern. A pattern can import primitives. A page imports patterns (and sometimes primitives).

---

## 14. Checklist for new work

Before you call a design/component done:

- [ ] Every colour is a semantic token (`bg-primary`, `text-foreground-muted`, …) — no hex, no primitive palette numbers except for avatar tones.
- [ ] Every space/padding/gap is `xs | sm | md | base | lg | xl | 2xl`.
- [ ] Every size is one of `text-12 / 13 / 14 / 16 / 20`.
- [ ] Every weight is `regular | medium | semibold`.
- [ ] Single-line content uses `leading-120`; multi-line prose uses `leading-160`.
- [ ] Every radius is one of `rounded-sm | md | lg | full`.
- [ ] Every shadow is `shadow-subtle | default | hover`.
- [ ] Every icon uses `<Icon name="…" size="…" />`, not a raw SVG.
- [ ] Every interactive element has hover, focus (`ring-ring`), and disabled states.
- [ ] Every icon-only button has an `aria-label`.
- [ ] The composition reuses existing primitives + patterns; new code in `components/ui` or `components/patterns` is a last resort.
- [ ] If you added a primitive or pattern, you added a demo in [`app/components/*`](app/components/).
- [ ] The page sits inside `AppShell` + `PageContent` with a `PageHeaderList` or `PageHeaderDetail`.
- [ ] `primary` appears at most once per visible region (the main action).
- [ ] Status colour is used only when something has a status.

---

## Appendix — file map

- **Tokens:** [app/globals.css](app/globals.css)
- **Primitives:** [components/ui/](components/ui/)
- **Patterns:** [components/patterns/](components/patterns/)
- **Demos:** [components/patterns/_demos/](components/patterns/_demos/)
- **Showcase pages (human-readable tour):** [app/components/](app/components/) — served at `/components`
- **App pages:** [app/(app)/](app/(app)/)
- **Icon library:** [components/ui/icons-data.ts](components/ui/icons-data.ts) — list of names in [components/ui/icon.tsx](components/ui/icon.tsx)
- **Token showcase:** `/components/tokens`
- **Semantic data (for pages):** [app/components/_shared/data.ts](app/components/_shared/data.ts)
