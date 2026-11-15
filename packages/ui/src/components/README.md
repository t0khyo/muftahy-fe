# UI Components

## Overview

shadcn/ui components built on Base UI primitives, configured with the `base-nova` preset and RTL support enabled. All components use semantic design tokens (never raw hex or arbitrary values), support both light and dark themes, and use logical CSS properties for bidirectional (LTR/RTL) layout compatibility. Do not edit these files directly — use the shadcn CLI to add or update components.

## Interface

- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` — collapsible content panels (Base UI `Accordion`)
- `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction` — status/feedback banners with `default` and `destructive` variants
- `Badge`, `badgeVariants` — inline status chips with `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` variants; supports Base UI `render` prop
- `Button`, `buttonVariants` — primary interactive element; variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`; sizes: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` — content container with `default` and `sm` sizes
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal` — modal dialog (Base UI `Dialog`)
- `Input` — single-line text input (Base UI `Input`) with full ARIA invalid/disabled states
- `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuPositioner`, `navigationMenuTriggerStyle` — top-level site navigation (Base UI `NavigationMenu`)
- `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` — accessible dropdown (Base UI `Select`)
- `Separator` — horizontal or vertical rule (Base UI `Separator`)
- `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription` — slide-in panel (Base UI `Dialog`) with `top`, `right`, `bottom`, `left` sides
- `Skeleton` — animated loading placeholder

## Invariants

- All components use semantic tokens only (`bg-background`, `text-foreground`, `border-border`, etc.); raw hex and arbitrary Tailwind values are prohibited.
- Logical CSS properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`) are used throughout for RTL compatibility.
- Base UI `render` prop pattern is used for polymorphism; Radix `asChild` is not used.
- Dark mode is handled via the `.dark` class on a parent element, not via `dark:` utility patches on missing tokens.
- These are generated components — do not hand-edit. Use the shadcn CLI.

## Side Effects

- No network calls. Components render into the React tree; `Dialog` and `Sheet` use Base UI portals which append to `document.body`.

## Verification

- Run: `pnpm test`
