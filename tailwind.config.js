/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#133857',
          900: '#0e304f',
          950: '#092137',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        pressure: {
          adequate: '#10b981',   // 0-20 green
          moderate: '#06b6d4',   // 21-40 cyan
          high: '#f59e0b',       // 41-60 amber
          veryhigh: '#f97316',   // 61-80 orange
          critical: '#ef4444',   // 81-100 red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
