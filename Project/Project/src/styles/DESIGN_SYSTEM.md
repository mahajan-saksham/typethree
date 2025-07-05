# Type 3 Solar Platform Design System

## Overview

This document outlines the standardized design system for the Type 3 Solar Platform. It serves as a reference guide for maintaining visual consistency across the application. The design system is built on principles of clean, modern UI with a premium clean-tech aesthetic, featuring a dark theme with lime green accents.

## Core Design Principles

1. **8pt Grid System**: All spacing follows multiples of 8px (with 4px for finer adjustments)
2. **Dark Theme**: Dark backgrounds with lime green accents for a premium tech feel
3. **Glass Morphism**: Subtle transparency and blur effects for depth
4. **Consistent Interactions**: Standardized hover and animation effects
5. **Responsive Design**: Adapts seamlessly across device sizes

## Color Palette

### Primary Colors
- **Primary**: `#AAFF00` (Lime Green) - Used for accents, CTAs, and highlighting important elements
- **Dark**: `#121212` - Primary background color
- **Dark-900**: `#0A0A0A` - Secondary background color for gradients
- **Light**: `#FFFFFF` - Primary text color

### Opacity Variants
- **White with opacity**: `text-light/80` (80% opacity), `text-light/60` (60% opacity)
- **Primary with opacity**: `bg-primary/20` (20% opacity), `bg-primary/10` (10% opacity)

## Typography

### Font Families
- **Headings**: Satoshi (var(--font-heading))
- **Body**: Inter (var(--font-body))
- **Numeric**: IBM Plex Mono (var(--font-mono))

### Text Sizes
- **Headings**: 
  - H1: `text-5xl font-bold`
  - H2: `text-4xl font-bold`
  - H3: `text-3xl font-bold`
  - H4: `text-2xl font-medium`
  - H5: `text-xl font-medium`
- **Body**: 
  - Large: `text-lg`
  - Regular: `text-base`
  - Small: `text-sm`
  - Extra Small: `text-xs`

### Text Colors
- **Primary Text**: `text-light` (White)
- **Secondary Text**: `text-light/80` (80% opacity)
- **Tertiary Text**: `text-light/60` (60% opacity)
- **Accent Text**: `text-primary` (Lime Green)

## Spacing System

Based on the 8pt grid with these key tokens:

- **space-0**: 0px - Reset/overlap
- **space-1**: 4px - Icon gaps
- **space-2**: 8px - Label gaps
- **space-3**: 12px - Field groups
- **space-4**: 16px - Paragraph spacing
- **space-6**: 24px - Card padding
- **space-8**: 32px - Section dividers
- **space-10**: 40px - Hero elements
- **space-12**: 48px - Section padding
- **space-16**: 64px - Page blocks
- **space-20**: 80px - Large section breaks

## Card Components

### Standard Card Structure
```jsx
<motion.div 
  whileHover={{ y: -5, transition: { duration: 0.2 } }}
  className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[420px] flex flex-col backdrop-blur-lg bg-white/5 border border-white/10 hover:border-primary/20 transition-all duration-300 p-6 md:p-8"
>
  {/* Background gradient effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <div className="relative z-10 flex flex-col h-full">
    {/* Card content here */}
  </div>
</motion.div>
```

### Card Header Pattern
```jsx
<div className="flex items-center gap-4 mb-6">
  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
    <Icon className="h-6 w-6" />
  </div>
  <div>
    <h3 className="text-xl font-medium text-light/80">Title</h3>
    <p className="text-sm text-light/60">Subtitle</p>
  </div>
</div>
```

### List Item Pattern
```jsx
<motion.li 
  className="flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
  whileHover={{ x: 10 }}
>
  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
    <Icon className="h-5 w-5" />
  </div>
  <span>List item text</span>
</motion.li>
```

## Border Treatments

- **Default Border**: `border border-white/10`
- **Hover Border**: `hover:border-primary/20`
- **Border Radius**: `rounded-xl` for containers, `rounded-lg` for inner elements, `rounded-full` for icons

## Animation & Transitions

- **Standard Transition**: `transition-all duration-300`
- **Hover Card Animation**: `whileHover={{ y: -5, transition: { duration: 0.2 } }}`
- **Hover List Item Animation**: `whileHover={{ x: 10 }}`
- **Hover Background Effect**: Gradient appears with `transition-opacity duration-500`

## Button Styles

- **Primary Button**: `variant="primary" size="lg"`
- **Secondary Button**: `variant="secondary" size="lg"`
- **Full Width Button**: Add `fullWidth` prop

## Responsive Breakpoints

- **Mobile**: Default styles
- **Tablet**: `md:` prefix (768px and above)
- **Desktop**: `lg:` prefix (1024px and above)
- **Large Desktop**: `xl:` prefix (1280px and above)

## Best Practices

1. **Maintain Consistent Spacing**: Always use the defined spacing tokens
2. **Follow Typography Hierarchy**: Use the appropriate text sizes and weights
3. **Use Standard Card Patterns**: Follow the established card structure for consistency
4. **Consistent Animation Timing**: Keep animations at similar durations for a cohesive feel
5. **Responsive Considerations**: Always design with mobile-first approach
6. **Icon Treatment**: Place icons in consistent containers with appropriate backgrounds

## Implementation Examples

### Financial Benefits Card
```jsx
<motion.div 
  whileHover={{ y: -5, transition: { duration: 0.2 } }}
  className="relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group min-h-[420px] flex flex-col backdrop-blur-lg bg-white/5 border border-white/10 hover:border-primary/20 transition-all duration-300 p-6 md:p-8"
>
  {/* Background gradient effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  
  <div className="relative z-10 flex flex-col h-full">
    {/* Header */}
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary">
        <CircleDollarSign className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-xl font-medium text-light/80">Financial Benefits</h3>
        <p className="text-sm text-light/60">Save money with solar</p>
      </div>
    </div>
    
    {/* Content */}
    <div className="space-y-4 mb-8">
      <h3 className="text-3xl font-bold text-light">Maximize your savings with solar power</h3>
      <p className="text-light/60 text-lg">Invest in your future with clean, renewable energy</p>
    </div>
  </div>
</motion.div>
```
