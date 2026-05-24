---
name: friendarr-style
description: Use when reviewing or creating UI elements in Friendarr's web interface. Ensures visual consistency with the Seerr design system. Covers colors, typography, spacing, component patterns, and the differences between Tailwind CDN and the full @tailwindcss/forms plugin.
---

# Friendarr UI Style Guide

Friendarr's web UI is a single-page app (`src/ui/index.html`) styled to match the Seerr design system. It uses Tailwind CSS via CDN (NOT the full build pipeline with `@tailwindcss/forms` or `@tailwindcss/typography` plugins). This means some styles that Seerr gets from plugins must be applied manually.

## Design Tokens

| Token            | Value      | Tailwind          |
| ---------------- | ---------- | ----------------- |
| Body background  | `#111827`  | `bg-gray-900`     |
| Card/surface     | `#1f2937`  | `bg-gray-800`     |
| Input background | `#374151`  | `bg-gray-700`     |
| Input border     | `#6b7280`  | `border-gray-500` |
| Divider          | `#374151`  | `border-gray-700` |
| Primary accent   | `#4f46e5`  | `indigo-600`      |
| Accent hover     | `#6366f1`  | `indigo-500`      |
| Danger           | `#dc2626`  | `red-600`         |
| Success          | `#22c55e`  | `green-500`       |
| Warning          | `#eab308`  | `yellow-500`      |
| Border radius    | `0.375rem` | `rounded-md`      |
| Text primary     | `#fff`     | `text-white`      |
| Text secondary   | `#d1d5db`  | `text-gray-300`   |
| Text muted       | `#9ca3af`  | `text-gray-400`   |
| Text subtle      | `#6b7280`  | `text-gray-500`   |
| Font family      | Inter      | `font-sans`       |
| Body size        | `0.875rem` | `text-sm`         |

## CSS Fallbacks (no @tailwindcss/forms)

Seerr uses the `@tailwindcss/forms` plugin which resets form elements. Since we use Tailwind CDN, these must be applied manually via `<style>` tags:

### Select dropdown

```css
select:not([multiple]) {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  display: block;
  color-scheme: dark;
  background-color: #374151;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
}
select:not([multiple]) option {
  background-color: #1f2937;
  color: #fff;
}
```

The shared base rule (applied to text inputs AND select):

```css
input[type="text"],
input[type="password"],
input[type="number"],
select:not([multiple]),
textarea {
  appearance: none;
  background-color: #374151;
  border: 1px solid #6b7280;
  border-radius: 0.375rem;
  color: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  width: 100%;
  min-width: 0;
  flex: 1 1 0%;
  transition: border-color 150ms ease-in-out;
}
```

The `.form-input-field` wrapper (required for consistent flex sizing):

```css
.form-input-field {
  display: flex;
  max-width: 36rem;
  border-radius: 0.375rem;
}
```

```html
<div class="form-input-field">
  <select id="ep-type">
    ...
  </select>
</div>
```

### Checkbox

```css
input[type="checkbox"] {
  height: 1.5rem;
  width: 1.5rem;
  border-radius: 0.375rem;
  color: #4f46e5; /* accent color (text-indigo-600 used by forms plugin) */
  transition: 150ms ease-in-out;
}
```

### Text inputs

```css
input[type="text"],
input[type="password"],
input[type="number"],
select:not([multiple]),
textarea {
  appearance: none;
  background-color: #374151; /* bg-gray-700 */
  border: 1px solid #6b7280; /* border-gray-500 */
  border-radius: 0.375rem; /* rounded-md */
  color: white;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
  width: 100%;
  min-width: 0;
  flex: 1 1 0%;
  transition: border-color 150ms ease-in-out;
}
```

### Focus ring

```css
input[type="text"]:focus,
input[type="password"]:focus,
input[type="number"]:focus,
select:not([multiple]):focus,
textarea:focus {
  outline: none;
  border-color: #6366f1; /* indigo-500 */
  box-shadow: 0 0 0 1px #6366f1;
}
```

### Form input field wrapper

```css
.form-input-field {
  display: flex;
  max-width: 36rem; /* max-w-xl */
  border-radius: 0.375rem; /* rounded-md */
}
```

## Component Patterns

### Buttons

| Variant | Classes                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| Primary | `btn-primary` — `bg-indigo-600/80 border border-indigo-500 text-white hover:bg-indigo-600`                 |
| Ghost   | `btn-ghost` — `bg-transparent border border-gray-600 text-gray-200 hover:text-white hover:border-gray-200` |
| Danger  | `btn-danger` — `bg-red-600/80 border border-red-500 text-white hover:bg-red-600`                           |
| Sizes   | `btn-sm` (px-2.5 py-1.5 text-xs), `btn-xs` (px-1.5 py-1 text-xs). Default: px-4 py-2 text-sm.              |

All buttons: `inline-flex items-center justify-center rounded-md font-medium leading-5 transition duration-150 ease-in-out cursor-pointer whitespace-nowrap disabled:opacity-50`

### Status badges

```css
statusBadge('queued')      → bg-gray-600 text-gray-200 rounded-full px-2.5 py-0.5 text-xs font-semibold
statusBadge('downloading') → bg-indigo-500/80 text-indigo-100 border border-indigo-500
statusBadge('complete')    → bg-green-500/80 text-green-100 border border-green-500
statusBadge('failed')      → bg-red-600/80 text-red-100 border border-red-500
```

### Sidebar

```css
.sidebar {
  background: linear-gradient(180deg, rgba(31, 41, 55, 1) 0%, #131928 100%);
  border-right: 1px solid #374151;
}
```

Fixed position: `fixed bottom-0 left-0 top-0 w-64`

### Active nav link

```
bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500
```

### Inactive nav link

```
text-gray-300 hover:bg-gray-700 hover:text-white
```

### Cards / Sections

```html
<div class="rounded-lg border border-gray-700 bg-gray-800 p-6">
  <h3 class="text-brand text-lg font-bold mb-2">Section Title</h3>
  <p class="text-sm text-gray-400 mb-4">Section description</p>
  ...
</div>
```

### Table

```html
<div class="overflow-hidden rounded-lg ring-1 ring-gray-700">
  <table class="min-w-full">
    <thead>
      <tr>
        <th
          class="px-4 py-3 bg-gray-700 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
        >
          Column
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-700 bg-gray-800">
      <tr>
        <td class="px-4 py-3 text-sm text-white">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Banner / Alert

```html
<!-- Warning -->
<div
  class="mb-4 rounded-md border border-yellow-500 bg-yellow-500/20 px-3 py-2 text-sm text-yellow-200"
>
  ...
</div>
<!-- Info (result) -->
<div
  class="mt-3 rounded-md border border-yellow-500 bg-yellow-500/20 px-3 py-2 text-sm text-yellow-200"
>
  ...
</div>
```

### Modal

```html
<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/70">
  <div
    class="relative w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl ring-1 ring-gray-700"
  >
    <h3 class="text-brand text-xl font-bold mb-4">Title</h3>
    <p class="text-sm text-gray-400 mb-4">Description</p>
    ...
  </div>
</div>
```

### Brand gradient text

```css
.text-brand {
  background: linear-gradient(to bottom right, #818cf8, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## Review Checklist

When reviewing any UI change in `src/ui/index.html`, verify:

1. **Colors match design tokens** — no hardcoded colors that aren't in the table above
2. **Select uses `select:not([multiple])` selector** — bare `select` loses to Tailwind CDN preflight's `padding: 0` due to equal specificity + later injection order. The `:not([multiple])` pseudo-class bumps specificity to 0,1,1, matching the `input[type='text']` selector level.
3. **Every form control is wrapped in `.form-input-field`** — the flex container is required for `flex: 1 1 0%` to resolve correctly, giving consistent sizing across inputs and selects
4. **Select has `display: block`** — Seerr explicitly sets this on form controls; without it, browser-native `inline-block` on `<select>` causes height mismatches
5. **Select chevron matches Seerr's SVG** — 20x20 viewBox, `stroke="#6b7280"`, `background-size: 1.5em`, `padding-right: 2.5rem`
6. **Border radius is `rounded-md` everywhere** — consistent 0.375rem
7. **Inter font is loaded** — via Google Fonts link in `<head>`
8. **Transitions use `duration-150 ease-in-out`** — matching Seerr's component animation
9. **Backgrounds use `/80` opacity for default state** — matching Seerr's glass-morphism pattern (buttons, badges)
10. **No `@tailwindcss/forms` dependent classes** — CDN doesn't have `form-input`, `form-select`, `form-checkbox`, `form-textarea` utilities
11. **Scrollbar styles are set** — thin scrollbar with gray-600 thumb / gray-800 track
12. **Sidebar is fixed, w-64, with gradient** — not static or differently sized
13. **Text hierarchy is correct** — headings: `text-brand`, labels: `text-gray-400 text-sm font-medium`, body: `text-white text-sm`, muted: `text-gray-500 text-xs`

## Common Gotchas

- **Tailwind CDN preflight specificity bug**: The CDN preflight sets `padding: 0` on `button, input, optgroup, select, textarea` (specificity 0,0,1). Our `input[type='text']` beats it (0,1,1 via attribute selector), but bare `select` (0,0,1) ties — and since the CDN injects its `<style>` after ours, it wins. **Always use `select:not([multiple])`** (0,1,1) in every selector that targets `<select>` to match inputs' specificity level.
- **`<select>` needs `display: block`**: After `appearance: none`, browsers may render `<select>` as `inline-block` (browser default), causing height mismatches with `<input>` which defaults to `inline-block` but gets forced by the forms plugin's `display: block`. Seerr's globals.css explicitly sets `display: block` on form controls.
- **`.form-input-field` wrapper is required**: Seerr wraps every form control in `<div class="form-input-field">` (a `display: flex` container with `max-w-xl`). Without this flex context, the `flex: 1 1 0%` on the form control has no effect. Every input and select in the UI must be inside a `.form-input-field` wrapper.
- **Chevron SVG must match Seerr exactly**: The `@tailwindcss/forms` plugin uses a specific 20x20 SVG with `stroke="#6b7280"` (not `fill`). The `background-size` is `1.5em 1.5em` and `padding-right` is `2.5rem`. Any other values will look off.
- **`<option>` can't be styled**: Browser-native `<option>` elements inside `<select>` inherit OS styles. They'll look inconsistent but this is expected and acceptable. Use `color-scheme: dark` and `option { background-color: #1f2937; color: #fff }` as best-effort fallbacks.
- **Tailwind CDN doesn't tree-shake**: All classes are available, but custom `@apply` directives won't work. Use inline class strings.
- **No dark mode variant**: The CDN doesn't include `dark:` variants. The entire UI is dark by default.
- **Escape all user data**: The `esc()` helper function must be used on any dynamic text content to prevent XSS.
