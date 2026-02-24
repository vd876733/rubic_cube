/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#020617',
        'dark-panel': '#0f172a1a',
        'neon-cyan': '#06b6d4',
        'neon-purple': '#a855f7',
        'neon-pink': '#ec4899',
      },
      backdropBlur: {
        'glass': '12px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(6, 182, 212, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
    },
  },
  plugins: [],
}
