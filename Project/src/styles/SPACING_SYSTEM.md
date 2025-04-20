# Type 3 Solar Platform - Spacing System

## Overview

This document outlines the comprehensive spacing system used throughout the Type 3 Solar Platform. Our spacing system is built on an 8-point grid (with 4px as the base unit) to ensure consistent, harmonious spacing across all UI components and layouts.

## Spacing Scale

All spacing in the application follows this scale. Use these tokens for margins, paddings, gaps, and positioning.

| Token     | Value  | Usage Examples |
|-----------|--------|----------------|
| `space-0` | 0px    | Reset, overlap elements |
| `space-1` | 4px    | Icon gaps, micro text spacing |
| `space-2` | 8px    | Input label gaps, badge padding |
| `space-3` | 12px   | Field groups, header/subtext spacing |
| `space-4` | 16px   | Paragraph spacing, button rows |
| `space-6` | 24px   | Card padding, form group margin |
| `space-8` | 32px   | Section dividers, content block gaps |
| `space-10`| 40px   | Hero elements, card grid gaps |
| `space-12`| 48px   | Section vertical padding |
| `space-16`| 64px   | Top-level page blocks, footer/header padding |
| `space-20`| 80px   | Large section breaks on desktop |

## Responsive Spacing Guidelines

### Layout & Containers

- **Page Container Padding**
  - Mobile: `px-4` (16px)
  - Tablet: `px-8` (32px)
  - Desktop: `px-16` (64px)

- **Section Spacing**
  - Mobile: `py-8` (32px)
  - Tablet: `py-10` (40px)
  - Desktop: `py-12` to `py-16` (48-64px)

- **Grid Gap System**
  - Card grids: `gap-4` (mobile) → `gap-6` (desktop)
  - Form layouts: `gap-6`
  - Content blocks: `gap-8`

### Component-Specific Spacing

#### Cards & Modules

- **Card Padding**
  - Mobile: `p-4` (16px)
  - Tablet+: `p-6` (24px)

- **Internal Card Spacing**
  - Title → Content: `mb-3` (12px)
  - Content → CTA: `mt-4` (16px)
  - Card-to-card spacing: `gap-6` (24px)

#### Typography Rhythm

- Heading → Paragraph: `mb-4` (16px)
- Paragraph → Paragraph: `mb-4` (16px)
- Caption → Paragraph: `mt-2` (8px)
- Use `space-y-4` for stacked text blocks

#### Forms & Inputs

- Label → Input: `mb-2` (8px)
- Input → Help text: `mt-1` (4px)
- Field → Field: `mb-4` (16px)
- Form block margin: `mt-6` (24px)

#### Navigation & Footer

- **Sidebar Link Spacing**
  - Vertical padding: `py-2` (8px)
  - Horizontal padding: `pl-4` (16px)

- **Navbar Padding**
  - Mobile: `py-3 px-4` (12px/16px)
  - Desktop: `py-4 px-8` (16px/32px)

- **Footer Spacing**
  - Footer sections: `gap-8` (32px)
  - Top margin: `mt-12` (48px)

#### Modals & Panels

- Modal padding: `p-6` (24px)
- Modal title → content: `mb-4` (16px)
- Content → CTA: `mt-6` (24px)
- Multi-line forms: `space-y-4` (16px)

## Mobile Adjustments

- Tighten section padding to `py-6` or `py-8`
- Cards: `p-4`, grid gap `gap-4`
- Buttons: `w-full`, `mt-4` spacing after inputs
- Keep vertical spacing generous for scroll flow

## Implementation

### CSS Variables

All spacing values are available as CSS variables:

```css
--space-0: 0px;
--space-1: 4px;
--space-2: 8px;
/* etc. */
```

### Tailwind Utilities

Use Tailwind utility classes for spacing:

```jsx
// Margin examples
<div className="mt-4">...</div>  // margin-top: 16px
<div className="mb-6">...</div>  // margin-bottom: 24px

// Padding examples
<div className="p-4">...</div>   // padding: 16px
<div className="px-6 py-4">...</div> // padding: 16px 24px

// Gap examples
<div className="gap-4">...</div> // gap: 16px
```

### Responsive Utilities

Use responsive prefixes to adjust spacing at different breakpoints:

```jsx
<div className="p-4 md:p-6 lg:p-8">...</div>
```

## Best Practices

1. **Always use spacing tokens** — avoid custom pixel values
2. Use `margin-top` for downward vertical rhythm
3. Avoid mixing padding + margin for the same layout role
4. Stick to multiples of 4px across the entire system
5. Use the appropriate spacing for the component and context

## Vertical Rhythm Utilities

For consistent vertical spacing between elements, use these utility classes:

- `.stack` - Adds `margin-top: 16px` to all direct children except the first
- `.stack-sm` - Adds `margin-top: 8px` to all direct children except the first
- `.stack-lg` - Adds `margin-top: 24px` to all direct children except the first

## Grid Presets

For common grid layouts, use these preset classes:

- `.grid-cards` - Grid with appropriate gap for card layouts
- `.grid-forms` - Grid with appropriate gap for form layouts
- `.grid-content` - Grid with appropriate gap for content blocks
