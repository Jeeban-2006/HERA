import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#050810',
        surface: '#0B1120',
        'bio-teal': '#00FFD1',
        'bio-coral': '#FF5F7E',
        'bio-gold': '#FFD166',
        'bio-violet': '#9B5DE5',
        'text-primary': '#F0F4FF',
        'text-muted': '#6B7B9E',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        accent: ['Cormorant Garamond', 'serif'],
      },
      fontSize: {
        hero: '96px',
        h1: '72px',
        h2: '56px',
        h3: '44px',
      },
      boxShadow: {
        'glow-teal': '0 0 40px rgba(0, 255, 209, 0.25)',
        'glow-coral': '0 0 40px rgba(255, 95, 126, 0.25)',
        'glow-gold': '0 0 40px rgba(255, 209, 102, 0.25)',
        'glow-violet': '0 0 40px rgba(155, 93, 229, 0.25)',
        'glow-lg': '0 0 20px rgba(0, 255, 209, 0.15), 0 0 40px rgba(0, 255, 209, 0.08)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'dna-spin': 'dna-spin 2s linear infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'sweep': 'sweep 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 209, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 209, 0.25)' },
        },
      },
      transitionDuration: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
        'very-slow': '800ms',
      },
    },
  },
  plugins: [],
};

export default config;
