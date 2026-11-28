# UI Components

## Overview

shadcn/ui components built on Base UI primitives, configured with the `base-nova` preset and RTL support enabled. All components use semantic design tokens (never raw hex or arbitrary values), support both light and dark themes, and use logical CSS properties for bidirectional (LTR/RTL) layout compatibility. Do not edit these files directly — use the shadcn CLI to add or update components.

## Interface

- `[accordion.tsx:Accordion]` `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` — collapsible content panels (Base UI `Accordion`)
- `[alert.tsx:Alert]` `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction` — status/feedback banners with `default` and `destructive` variants
- `[badge.tsx:Badge]` `Badge`, `badgeVariants` — inline status chips with `default`, `secondary`, `destructive`, `outline`, `ghost`, `link` variants; supports Base UI `render` prop
- `[button.tsx:Button]` `Button`, `buttonVariants` — primary interactive element; variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`; sizes: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- `[card.tsx:Card]` `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` — content container with `default` and `sm` sizes
- `[carousel.tsx:Carousel]` `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `useCarousel`, `type CarouselApi` — Embla-powered carousel component with LTR/RTL direction awareness
- `[checkbox.tsx:Checkbox]` `Checkbox` — accessible checkbox toggle (Base UI `Checkbox`)
- `[dialog.tsx:Dialog]` `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal` — modal dialog (Base UI `Dialog`)
- `[field.tsx:Field]` `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator`, `FieldSet`, `FieldContent`, `FieldTitle` — accessible form field primitives
- `[input.tsx:Input]` `Input` — single-line text input (Base UI `Input`) with full ARIA invalid/disabled states
- `[label.tsx:Label]` `Label` — accessible input label
- `[navigation-menu.tsx:NavigationMenu]` `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuPositioner`, `navigationMenuTriggerStyle` — top-level site navigation (Base UI `NavigationMenu`)
- `[radio-group.tsx:RadioGroup]` `RadioGroup`, `RadioGroupItem` — accessible radio group selection controls (Base UI `RadioGroup`)
- `[scramble-text.tsx:ScrambleText]` `ScrambleText`, `ScrambleMaskText`, `type ScrambleTextProps`, `type ScrambleMaskTextProps`, `type ScrambleDirection` — accessible character-scramble reveal and reverse-scramble hide animation honoring `prefers-reduced-motion`
- `[select.tsx:Select]` `Select`, `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` — accessible dropdown (Base UI `Select`)
- `[separator.tsx:Separator]` `Separator` — horizontal or vertical rule (Base UI `Separator`)
- `[sheet.tsx:Sheet]` `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription` — slide-in panel (Base UI `Dialog`) with `top`, `right`, `bottom`, `left` sides
- `[skeleton.tsx:Skeleton]` `Skeleton` — animated loading placeholder
- `[switch.tsx:Switch]` `Switch` — accessible boolean toggle switch (Base UI `Switch`)
- `[table.tsx:Table]` `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` — data table components
- `[sonner.tsx:Toaster]` `Toaster`, `toast` — toast notifications (Sonner) with direction awareness and theme support

## Invariants

- All components use semantic tokens only (`bg-background`, `text-foreground`, `border-border`, etc.); raw hex and arbitrary Tailwind values are prohibited.
- Logical CSS properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`) are used throughout for RTL compatibility.
- Base UI `render` prop pattern is used for polymorphism; Radix `asChild` is not used.
- Dark mode is handled via the `.dark` class on a parent element, not via `dark:` utility patches on missing tokens.
- These are generated components — do not hand-edit directly. Use the shadcn CLI.

## Side Effects

- Components render into the React tree; modal and overlay components (`Dialog`, `Sheet`) use Base UI portals which render outside the parent DOM hierarchy into `document.body`.

## Verification

- Run: `pnpm test`
