// This file defines theme properties used by legacy styled-components
// to enable backward compatibility during migration to Tailwind CSS

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    borders: ThemeBorders;
    radii: ThemeRadii;
    effects: ThemeEffects;
  }
}

interface ThemeColors {
  white: string;
  neonPink: string;
  electricYellow: string;
  limeGreen: string;
  skyBlue: string;
  background: string;
  backgroundAlt: string;
  magenta: string;
  yellow: string;
  purple: string;
  blue: string;
  coral: string;
  mint: string;
  lavender: string;
  pink: string;
  darkText: string;
  lightText: string;
  subtext: string;
  success: string;
  error: string;
  warning: string;
}

interface ThemeEffects {
  transition: {
    fast: string;
    normal: string;
    slow: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  overlay: {
    light: string;
    dark: string;
    magenta: string;
    yellow: string;
    purple: string;
    blue: string;
  };
  glow: {
    neonPink: string;
    electricYellow: string;
    limeGreen: string;
    skyBlue: string;
  };
}

interface ThemeTypography {
  fontFamily: {
    headline: string;
    primary: string;
    body: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    base: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
    body: string;
    bodyLarge: string;
    small: string;
    display: string;
  };
  letterSpacing: {
    wide: string;
  };
}

interface ThemeRadii {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  pill: string;
}

interface ThemeBorders {
  none: string;
  thin: string;
  medium: string;
  thick: string;
}

interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}
