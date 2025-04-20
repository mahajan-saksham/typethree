export const typography = {
  fonts: {
    heading: 'Space Grotesk, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace'
  },
  sizes: {
    h1: {
      size: '4rem',      // 64px
      lineHeight: '1.1',
      weight: '700',
      tracking: '-0.02em'
    },
    h2: {
      size: '3rem',      // 48px
      lineHeight: '1.2',
      weight: '700',
      tracking: '-0.01em'
    },
    h3: {
      size: '2rem',      // 32px
      lineHeight: '1.3',
      weight: '600',
      tracking: '-0.01em'
    },
    h4: {
      size: '1.5rem',    // 24px
      lineHeight: '1.4',
      weight: '600',
      tracking: 'normal'
    },
    h5: {
      size: '1.25rem',   // 20px
      lineHeight: '1.4',
      weight: '600',
      tracking: 'normal'
    },
    h6: {
      size: '1rem',      // 16px
      lineHeight: '1.5',
      weight: '600',
      tracking: 'normal'
    },
    subtitle1: {
      size: '1.25rem',   // 20px
      lineHeight: '1.5',
      weight: '500',
      tracking: 'normal'
    },
    subtitle2: {
      size: '1.125rem',  // 18px
      lineHeight: '1.5',
      weight: '500',
      tracking: 'normal'
    },
    body1: {
      size: '1rem',      // 16px
      lineHeight: '1.5',
      weight: '400',
      tracking: 'normal'
    },
    body2: {
      size: '0.875rem',  // 14px
      lineHeight: '1.5',
      weight: '400',
      tracking: 'normal'
    },
    caption: {
      size: '0.75rem',   // 12px
      lineHeight: '1.5',
      weight: '400',
      tracking: 'normal'
    },
    overline: {
      size: '0.75rem',   // 12px
      lineHeight: '1.5',
      weight: '500',
      tracking: '0.1em',
      transform: 'uppercase'
    },
    mono: {
      size: '0.875rem',  // 14px
      lineHeight: '1.5',
      weight: '500',
      tracking: '-0.01em'
    }
  }
} as const;