import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--theme-bg)',
          card: 'var(--theme-card)',
          cardHover: 'var(--theme-card-hover)',
          border: 'var(--theme-border)',
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          muted: 'var(--theme-muted)',
          accent: 'var(--theme-accent)',
        },
        /* Mapped to stefanutc1.github.io / drivepoint.ro Obsidian-Plum & Burgundy Surfaces */
        obsidian: {
          950: '#0c0c0c',
          900: '#140b0f',
          850: '#17090d',
          800: '#1f1116',
          750: '#24181e',
          700: '#331c25',
          600: '#401823',
          500: '#52212e',
        },
        /* Mapped to Warm Ivory (#efebe5), Warm Sand (#d9d1ca), and Warm Taupe (#827470) */
        slate: {
          50: '#efebe5',
          100: '#efebe5',
          200: '#e6dfd7',
          300: '#d9d1ca',
          400: '#a89c96',
          500: '#827470',
          600: '#635652',
          700: '#401823',
          800: '#24181e',
          900: '#140b0f',
          950: '#0c0c0c',
        },
        /* Harmonized Semantic Accents matching the Burgundy & Warm Ivory Palette */
        emerald: {
          300: '#efebe5',
          400: '#d9d1ca',
          500: '#52212e',
          600: '#401823',
          700: '#24181e',
        },
        rose: {
          300: '#efebe5',
          400: '#d9d1ca',
          500: '#52212e',
          600: '#401823',
        },
        amber: {
          300: '#efebe5',
          400: '#d9d1ca',
          500: '#827470',
          600: '#52212e',
        },
        cyan: {
          300: '#efebe5',
          400: '#d9d1ca',
          500: '#52212e',
        },
        copper: {
          400: '#d9d1ca',
          500: '#52212e',
          600: '#401823',
        },
        violet: {
          400: '#d9d1ca',
          500: '#52212e',
          600: '#401823',
        },
      },
      fontFamily: {
        serif: ['"Inter Display"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['Inter', '"Inter Display"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Space Mono"', 'ui-monospace', 'monospace'],
        display: ['"Inter Display"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
