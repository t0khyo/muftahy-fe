# Design system

Visual rules for the storefront and admin. Both apps share these tokens. Follow this file for every visual decision. Do not invent colors, fonts, or sizes.

## 1. Direction

- Calm, clean, apple.com-inspired: untinted neutral grays, one strong blue (`#0068e3`), restrained decoration.
- Light and dark are both first-class. Follow the system setting by default. Light is the reference design, dark is tuned separately, not inverted.
- Arabic (RTL) and English (LTR) are equals.
- Density follows marketplace practice: airy hero sections, compact browsing grids. Decided per page.
- Radius, shadows, and component shape come from the current shadcn preset. Do not override them.

## 2. Tokens

- Colors are `oklch` CSS variables on `:root` and `.dark`, using shadcn's semantic names plus `success`, `warning`, `info`, `discount`, `link`.
- Components use semantic classes only (`bg-background`, `text-muted-foreground`). Never raw hex, `rgb()`, or arbitrary color values.
- Theme CSS lives in the shared UI package (usually `packages/ui/src/styles/globals.css`). Rebranding means editing it only.

```css
:root {
  --background: oklch(1 0 0);                  --foreground: oklch(0.232 0.004 286.1);       /* #fff / #1d1d1f */
  --card: oklch(1 0 0);                        --card-foreground: oklch(0.232 0.004 286.1);
  --popover: oklch(1 0 0);                     --popover-foreground: oklch(0.232 0.004 286.1);
  --primary: oklch(0.544 0.204 258.3);         --primary-foreground: oklch(1 0 0);           /* #0068e3 */
  --secondary: oklch(0.971 0.003 286.4);       --secondary-foreground: oklch(0.232 0.004 286.1); /* #f5f5f7 */
  --muted: oklch(0.971 0.003 286.4);           --muted-foreground: oklch(0.540 0.008 286.1); /* #6e6e73 */
  --accent: oklch(0.941 0.005 286.3);          --accent-foreground: oklch(0.232 0.004 286.1); /* #ebebef */
  --destructive: oklch(0.553 0.225 27.3);      --destructive-foreground: oklch(1 0 0);       /* #d70015 */
  --success: oklch(0.512 0.129 148.9);         --success-foreground: oklch(1 0 0);           /* #1f7a3a */
  --warning: oklch(0.542 0.124 62.5);          --warning-foreground: oklch(1 0 0);           /* #a15c00 */
  --info: oklch(0.544 0.204 258.3);            --info-foreground: oklch(1 0 0);              /* #0068e3 */
  --discount: oklch(0.553 0.174 38.4);         --discount-foreground: oklch(1 0 0);          /* #c2410c */
  --link: oklch(0.544 0.204 258.3);
  --border: oklch(0.865 0.007 286.3);          /* #d2d2d7, decorative dividers only */
  --input: oklch(0.622 0.007 286.2);           /* #86868b, form control borders */
  --ring: oklch(0.544 0.204 258.3);
  --chart-1: oklch(0.544 0.204 258.3); --chart-2: oklch(0.556 0.203 278.1); --chart-3: oklch(0.700 0.111 212.7);
  --chart-4: oklch(0.782 0.171 67.2);  --chart-5: oklch(0.656 0.227 312.4);
  --sidebar: var(--secondary);         --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);   --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);     --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);     --sidebar-ring: var(--ring);
}

.dark {
  --background: oklch(0 0 0);                  --foreground: oklch(0.971 0.003 286.4);       /* #000 / #f5f5f7 */
  --card: oklch(0.232 0.004 286.1);            --card-foreground: oklch(0.971 0.003 286.4);  /* #1d1d1f */
  --popover: oklch(0.232 0.004 286.1);         --popover-foreground: oklch(0.971 0.003 286.4);
  --primary: oklch(0.544 0.204 258.3);         --primary-foreground: oklch(1 0 0);           /* same #0068e3 */
  --secondary: oklch(0.294 0.004 286.2);       --secondary-foreground: oklch(0.971 0.003 286.4); /* #2c2c2e */
  --muted: oklch(0.294 0.004 286.2);           --muted-foreground: oklch(0.711 0.007 286.2); /* #a1a1a6 */
  --accent: oklch(0.341 0.003 286.2);          --accent-foreground: oklch(0.971 0.003 286.4); /* #38383a */
  --destructive: oklch(0.663 0.224 28.3);      --destructive-foreground: oklch(0 0 0);       /* #ff453a */
  --success: oklch(0.756 0.208 147.0);         --success-foreground: oklch(0 0 0);           /* #30d158 */
  --warning: oklch(0.820 0.152 73.2);          --warning-foreground: oklch(0 0 0);           /* #ffb340 */
  --info: oklch(0.669 0.181 251.8);            --info-foreground: oklch(0 0 0);              /* #2997ff */
  --discount: oklch(0.726 0.178 43.2);         --discount-foreground: oklch(0 0 0);          /* #ff7a3d */
  --link: oklch(0.669 0.181 251.8);
  --border: oklch(0.341 0.003 286.2);          --input: oklch(0.648 0.007 286.2);            /* #38383a / #8e8e93 */
  --ring: oklch(0.669 0.181 251.8);
  --chart-1: oklch(0.669 0.181 251.8); --chart-2: oklch(0.648 0.192 280.6); --chart-3: oklch(0.771 0.118 212.0);
  --chart-4: oklch(0.820 0.152 73.2);  --chart-5: oklch(0.767 0.172 313.8);
  --sidebar: var(--card);              /* other sidebar tokens reference the same variables as in :root */
}

@theme inline {  /* add next to the preset's existing mappings */
  --color-success: var(--success);   --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);   --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);         --color-info-foreground: var(--info-foreground);
  --color-discount: var(--discount); --color-discount-foreground: var(--discount-foreground);
  --color-link: var(--link);
}
```

Roles: `primary` brand and main action; `secondary`/`muted` quiet surfaces; `accent` hover and selected; `destructive` errors and irreversible actions; `success` success, in stock, instant delivery; `warning` warnings, low stock; `info` neutral notices; `discount` sale badges only; `link` inline links.

## 3. Color usage (60 / 30 / 10)

Target proportions on any screen:

- **~60% neutrals:** `background`, `foreground`, `card`.
- **~30% secondary surfaces:** `secondary`, `muted`, `accent`, `sidebar` (section bands, hover, table stripes, admin sidebar).
- **≤10% color:** `primary` and status colors. Treat 10% as a ceiling. White and `#f5f5f7` read as one neutral, so real color use is usually well under that.

Rules that keep it true:

1. **One primary button per view or card.** Secondary actions use `secondary`, `outline`, or `ghost`.
2. `primary` is only for the main call to action, links, selected states, and focus. Not for decoration, icons, or section backgrounds.
3. Status colors only for badges, alerts, and short messages. Never large backgrounds or full-width bands.
4. `discount` appears only on sale and discount indicators. Never for errors or warnings.
5. At most one colored accent per card or list row. If several apply, discount wins, then low stock, then everything else stays neutral.
6. Status is never color alone. Pair it with text or an icon.
7. Hierarchy comes from size, weight, and spacing before color.
8. Dark mode uses surface lightness for elevation (black page, `#1d1d1f` cards), not heavy shadows.

## 4. Contrast (WCAG 2.1 AA, checked)

- Light: text on background 16.8; muted text 5.1 (4.7 on secondary); white on primary 5.1; white on destructive/success/warning/discount 5.2-5.4; input border 3.6 (needs 3.0).
- Dark: text 19.3 on background, 15.5 on card; muted text 8.2 / 6.5; white on primary 5.1; primary on background 4.1 (UI only); link 7.0 / 5.6; black on destructive/success/warning/discount 6.2-11.8; input border 5.2.
- Form controls use `--input`, never `--border`, to meet the 3:1 rule.
- In dark mode, small text links use `text-link`, not `text-primary`.
- Pair every solid status color with its `-foreground` (black in dark mode, by design).
- Re-check contrast whenever a token changes.

## 5. Typography

- **Latin and digits:** Inter variable (`@fontsource-variable/inter`). **Arabic:** Tajawal 400, 500, 700 (`@fontsource/tajawal`). Self-host; import only the weights used.
- Stack: `"Inter Variable", "Tajawal", system-ui, sans-serif`. Inter lacks Arabic glyphs so Arabic falls through to Tajawal, and digits stay Western in both languages.
- Weights: 400 body, 500 labels and buttons, 700 headings.
- Scale (use only these): caption 12px, small 14px, body 16px, title 19px, heading 23px, display 28px, hero 40px (clamp on mobile; hero headlines only).
- Line height: Latin 1.5 body / 1.2 headings; Arabic 1.7 body / 1.4 headings.
- Arabic reads smaller: start with `html[lang="ar"] { font-size: 106.25%; }` and tune visually. No letter-spacing, uppercase, italics, or faux bold on Arabic.
- Prices, codes, and numeric columns use `tabular-nums`. Mixed-direction text (English name inside Arabic) uses `<bdi>` or `dir="auto"`.

## 6. Spacing, motion, theming

- **Spacing:** 4px grid via Tailwind's scale (4, 8, 12, 16, 24, 32, 48, 64). Touch targets at least 44px on mobile. Set content max width once in the app layout. Logical properties only.
- **Motion:** 150-200ms ease-out for small transitions, up to 300ms for overlays. Animate opacity and transform only. Honor `prefers-reduced-motion`.
- **Theming:** `dark` class on `<html>`, default to system, user can pick light, dark, or system and it persists. Apply it before first paint (inline script) to avoid a flash. Check every new component in light, dark, `ar`, and `en`.
- Admin and storefront share all tokens, fonts, and the scale. Page-level density differences must not add colors or fonts.

## 7. Not yet specified

- **Product card:** designed separately. Add its spec here when ready. Do not invent one.
- **Imagery:** cover art, logos, platform badges. Use neutral placeholders for now.

## 8. Agent notes

- Editing the theme CSS, adding the tokens above, and installing the two Fontsource packages are approved only when the user asks for design-system setup. Otherwise ask first.
- Keep the preset's radius and shadow tokens.
- After applying tokens, build an internal page showing buttons, inputs, select, badges (including status and discount), alerts, a card, and a table. Verify it in light, dark, `ar`, `en`.
- Report real typecheck, lint, test, and build results.