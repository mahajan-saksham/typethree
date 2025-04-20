/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CCFF00',
          hover: '#D4FF33',
          active: '#B8E600',
          disabled: '#E5FF80'
        },
        secondary: {
          DEFAULT: '#00E1FF',
          hover: '#33E7FF',
          active: '#00CAE6',
          disabled: '#80F0FF'
        },
        dark: {
          DEFAULT: '#0A0A0A',
          100: '#1A1A1A',
          200: '#2A2A2A',
          300: '#3A3A3A'
        },
        light: {
          DEFAULT: '#FFFFFF',
          100: '#F5F5F5',
          200: '#EBEBEB',
          300: '#E0E0E0'
        },
        success: {
          DEFAULT: '#00D26A',
          hover: '#00E974',
          active: '#00BD60'
        },
        error: {
          DEFAULT: '#FF5F56',
          hover: '#FF7A73',
          active: '#FF453A'
        },
        warning: {
          DEFAULT: '#FFB800',
          hover: '#FFC633',
          active: '#E6A600'
        },
        'text-primary': '#FFFFFF',
        'text-secondary': '#CCCCCC',
        'text-tertiary': '#999999',
        'text-accent': '#CCFF00',
        'text-legal': '#888888',
      },
      fontFamily: {
        heading: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace']
      },
      fontSize: {
        '5xl': [
          '2rem', // mobile 32px
          {
            lineHeight: '1.1',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            '@screen sm': { fontSize: '2.5rem' }, // 40px
            '@screen md': { fontSize: '3.5rem' } // 56px
          }
        ],
        '4xl': [
          '1.75rem', // 28px
          {
            lineHeight: '1.15',
            fontWeight: '700',
            letterSpacing: '-0.01em',
            '@screen sm': { fontSize: '2.25rem' }, // 36px
            '@screen md': { fontSize: '3rem' } // 48px
          }
        ],
        '3xl': [
          '1.5rem', // 24px
          {
            lineHeight: '1.2',
            fontWeight: '700',
            '@screen sm': { fontSize: '1.75rem' }, // 28px
            '@screen md': { fontSize: '2.25rem' } // 36px
          }
        ],
        '2xl': [
          '1.25rem', // 20px
          {
            lineHeight: '1.25',
            fontWeight: '600',
            '@screen sm': { fontSize: '1.375rem' }, // 22px
            '@screen md': { fontSize: '1.75rem' } // 28px
          }
        ],
        'xl': [
          '1.125rem', // 18px
          {
            lineHeight: '1.3',
            fontWeight: '600',
            '@screen md': { fontSize: '1.25rem' } // 20px
          }
        ],
        base: [
          '0.9375rem', // 15px
          {
            lineHeight: '1.5',
            fontWeight: '400',
            '@screen sm': { fontSize: '1rem' }, // 16px
            '@screen md': { fontSize: '1.125rem' } // 18px
          }
        ],
        sm: [
          '0.8125rem', // 13px
          {
            lineHeight: '1.3',
            fontWeight: '400',
            '@screen sm': { fontSize: '0.875rem' }, // 14px
            '@screen md': { fontSize: '0.875rem' } // 14px
          }
        ],
        xs: [
          '0.75rem', // 12px
          {
            lineHeight: '1.3',
            fontWeight: '300',
            '@screen sm': { fontSize: '0.75rem' },
            '@screen md': { fontSize: '0.75rem' }
          }
        ]
      },
      spacing: {
        /* Base 8pt grid system */
        0: '0',           // 0px - Reset, overlap
        px: '1px',        // 1px - Borders, fine details
        0.5: '0.125rem',  // 2px - Micro adjustments
        1: '0.25rem',     // 4px - Icon gaps, micro text
        1.5: '0.375rem',  // 6px - Fine adjustments
        2: '0.5rem',      // 8px - Input label gaps, badge padding
        2.5: '0.625rem',  // 10px - Fine adjustments
        3: '0.75rem',     // 12px - Field groups, header/subtext
        3.5: '0.875rem',  // 14px - Fine adjustments
        4: '1rem',        // 16px - Paragraph spacing, button rows
        5: '1.25rem',     // 20px - Medium spacing
        6: '1.5rem',      // 24px - Card padding, form group margin
        7: '1.75rem',     // 28px - Medium-large spacing
        8: '2rem',        // 32px - Section dividers, content block gaps
        9: '2.25rem',     // 36px - Medium-large spacing
        10: '2.5rem',     // 40px - Hero elements, card grid gaps
        11: '2.75rem',    // 44px - Large spacing
        12: '3rem',       // 48px - Section vertical padding
        14: '3.5rem',     // 56px - Large spacing
        16: '4rem',       // 64px - Top-level page blocks, footer/header padding
        20: '5rem',       // 80px - Large section breaks on desktop
        24: '6rem',       // 96px - Major section spacing
        28: '7rem',       // 112px - Extra large spacing
        32: '8rem',       // 128px - Maximum standard spacing
        36: '9rem',       // 144px - Extra large spacing
        40: '10rem',      // 160px - Maximum spacing for large screens
        44: '11rem',      // 176px - Maximum spacing for large screens
        48: '12rem',      // 192px - Maximum spacing for large screens
        52: '13rem',      // 208px - Maximum spacing for large screens
        56: '14rem',      // 224px - Maximum spacing for large screens
        60: '15rem',      // 240px - Maximum spacing for large screens
        64: '16rem',      // 256px - Maximum spacing for large screens
        72: '18rem',      // 288px - Maximum spacing for large screens
        80: '20rem',      // 320px - Maximum spacing for large screens
        96: '24rem'       // 384px - Maximum spacing for large screens
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px'
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px'
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'gradient-flow': 'gradient-flow 4s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' }
        },
        'gradient-flow': {
          '0%': { 'stop-color': 'var(--color-primary)' },
          '50%': { 'stop-color': 'var(--color-secondary)' },
          '100%': { 'stop-color': 'var(--color-primary)' }
        }
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        light: '300'
      },
      letterSpacing: {
        tightest: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.05em',
      },
      lineHeight: {
        snug: '1.1',
        tight: '1.2',
        normal: '1.5',
        relaxed: '1.6',
      },
    }
  },
  plugins: []
};