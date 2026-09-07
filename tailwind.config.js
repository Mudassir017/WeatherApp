/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0f1011',
        abyss: '#090a0b',
        graphite: '#2e2e2e',
        steel: '#3f4041',
        silver: '#cacaca',
        fog: '#6a6b6b',
        ash: '#9f9fa0',
        cloud: '#f5f5f7',
        pure: '#ffffff',
        void: '#000000',
        'iris-gleam': '#847dff',
        'cyan-signal': '#00b3dd',
        'pale-iris': '#d1c9ff',
        'deep-iris': '#4b49aa',
        'orchid-bloom': '#dd90d8',
        periwinkle: '#90b8f0',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'feature': '30px',
        'tile': '30px',
        'btn': '8px',
        'input': '8px',
        'pill': '9999px',
        'eyebrow': '1440px',
      },
      boxShadow: {
        'origin-lg': 'rgba(0, 0, 0, 0.2) 0px 18px 20px 0px',
      },
      letterSpacing: {
        'mono-wide': '0.182em',
        'mono-tight': '0.016em',
      }
    },
  },
  plugins: [],
}
