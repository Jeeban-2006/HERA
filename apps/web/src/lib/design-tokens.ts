export const colors = {
  void: '#050810',
  surface: '#0B1120',
  bioTeal: '#00FFD1',
  bioCoral: '#FF5F7E',
  bioGold: '#FFD166',
  bioViolet: '#9B5DE5',
  textPrimary: '#F0F4FF',
  textMuted: '#6B7B9E',
  error: '#FF5F7E',
  success: '#00FFD1',
  warning: '#FFD166',
  info: '#9B5DE5',
};

export const glows = {
  teal: '0 0 40px rgba(0, 255, 209, 0.25)',
  coral: '0 0 40px rgba(255, 95, 126, 0.25)',
  gold: '0 0 40px rgba(255, 209, 102, 0.25)',
  violet: '0 0 40px rgba(155, 93, 229, 0.25)',
};

export const shadowGlows = {
  teal: '0 0 20px rgba(0, 255, 209, 0.15), 0 0 40px rgba(0, 255, 209, 0.08)',
  coral: '0 0 20px rgba(255, 95, 126, 0.15), 0 0 40px rgba(255, 95, 126, 0.08)',
  gold: '0 0 20px rgba(255, 209, 102, 0.15), 0 0 40px rgba(255, 209, 102, 0.08)',
  violet: '0 0 20px rgba(155, 93, 229, 0.15), 0 0 40px rgba(155, 93, 229, 0.08)',
};

export const typography = {
  display: {
    family: "'Playfair Display', serif",
    weight: '700',
    sizes: {
      hero: '96px',
      h1: '72px',
      h2: '56px',
      h3: '44px',
    },
  },
  body: {
    family: "'DM Sans', sans-serif",
    weight: '400',
    sizes: {
      lg: '18px',
      base: '16px',
      sm: '14px',
      xs: '12px',
    },
  },
  mono: {
    family: "'JetBrains Mono', monospace",
    weight: '400',
    sizes: {
      base: '14px',
      sm: '12px',
    },
  },
  accent: {
    family: "'Cormorant Garamond', serif",
    weight: '400',
    style: 'italic',
    size: '22px',
  },
};

export const breakpoints = {
  xs: '375px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
};

export const transitions = {
  fast: '150ms',
  base: '300ms',
  slow: '500ms',
  verySlow: '800ms',
};

export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
