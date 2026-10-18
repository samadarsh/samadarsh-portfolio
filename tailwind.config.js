/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Tailwind's default --tw-* variables (51 of them) go only on elements whose classes use them,
  // not on every element and its ::before and ::after. Each restyle then has far less to apply:
  // on a mid-range phone, scrolling a case study's walkthrough restyled in half the time.
  experimental: { optimizeUniversalDefaults: true },
  theme: {
    extend: {
      fontFamily: {
        body: ['Geist', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'text-primary': 'hsl(var(--text) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        stroke: 'hsl(var(--stroke) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        // Faint lines and tints are written as white/[x]; on Paper they become ink.
        white: 'rgb(var(--ink) / <alpha-value>)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      animation: {
        'scroll-down': 'scroll-down 1.8s ease-in-out infinite',
      },
      keyframes: {
        'scroll-down': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '50%': { transform: 'translateY(4px)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
