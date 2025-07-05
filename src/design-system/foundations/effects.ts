// This file provides backwards compatibility for the old theme structure
// while the application is being migrated to the new Tailwind CSS system

export const effects = {
  transition: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  overlay: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.8)',
    magenta: 'rgba(255, 0, 255, 0.5)',
    yellow: 'rgba(255, 255, 0, 0.5)',
    purple: 'rgba(128, 0, 128, 0.5)',
    blue: 'rgba(0, 0, 255, 0.5)',
  },
  // These properties provide backward compatibility for the old theme structure
  glow: {
    neonPink: '0 0 10px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.7)',
    electricYellow: '0 0 8px rgba(236, 252, 88, 0.8)',
    limeGreen: '0 0 8px rgba(214, 255, 109, 0.8)',
    skyBlue: '0 0 8px rgba(93, 211, 255, 0.8)'
  }
};
