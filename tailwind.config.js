/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // เพิ่ม path อื่นๆ ถ้ามี
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Prompt', 'sans-serif'],
      },
      colors: {
        brand: '#1D3557',
        accent: '#2A9D8F',
        sand: '#E9C46A',
        cta: '#E76F51',
        bg: '#0C1829'
      }
    },
  },
  plugins: [],
}
