/** @type {import('tailwindcss').Config} */
import { defineConfig } from 'tailwindcss'

export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mainGreen: '#3BB273',
        accentLight: '#E8F5E9',
        darkGreen: '#2E7D32',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
})
