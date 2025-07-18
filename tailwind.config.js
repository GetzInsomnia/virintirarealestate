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
    },
  },
  plugins: [],
}
