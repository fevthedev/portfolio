/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/app/**/*.{js,ts,jsx,tsx}',     // App Router
      './src/components/**/*.{js,ts,jsx,tsx}', // Your components
    ],
    theme: {
      extend: {
        colors: {
          'west-tech-blue': '#0C4A8D',
        },
      },
    },
    plugins: [],
  }
  