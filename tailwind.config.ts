import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        acid: '#C6FF3D',
        acid2: '#9AE600',
        hot: '#FF3366',
        ink: '#0A0A0A',
        panel: '#141414',
        panel2: '#1C1C1C',
        line: '#262626',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(198,255,61,0.35), 0 10px 40px -10px rgba(198,255,61,0.25)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.6s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
