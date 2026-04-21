/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Palette MoodTracker ───────────────────────────────
        'mood-orange':  '#FF8C5A',   // couleur principale (boutons, accents)
        'mood-yellow':  '#FFD07A',   // dégradé haut de l app
        'mood-red-bg':  '#FF6B5A',   // dégradé bas de l app
        'mood-green':   '#5DC98A',   // humeur positive (calendrier)
        'mood-mid':     '#FFD07A',   // humeur moyenne (calendrier)
        'mood-low':     '#FF6060',   // humeur difficile (calendrier)
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
