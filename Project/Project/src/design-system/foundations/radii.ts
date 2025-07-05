// This file provides backwards compatibility for the old theme structure
// while the application is being migrated to the new Tailwind CSS system

export const radii = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '1rem',
  full: '9999px',
  // Add missing pill property for backwards compatibility
  pill: '9999px'
};
