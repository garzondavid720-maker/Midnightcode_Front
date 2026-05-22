/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:           "#9c4fba",
        "background-light":"#f7f6f8",
        "background-dark": "#050406",
        "neon-purple":     "#BF00FF",
        "neon-magenta":    "#FF00FF",
        "deep-charcoal":   "#0A0A0B",
      },
      fontFamily: {
        display:  ["Inter", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
        rajdhani: ["Rajdhani", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg:      "1rem",
        xl:      "1.5rem",
        full:    "9999px",
      },
      boxShadow: {
        "neon-glow":    "0 0 15px rgba(191,0,255,0.4)",
        "magenta-glow": "0 0 15px rgba(255,0,255,0.4)",
      },
    },
  },
  plugins: [],
}
