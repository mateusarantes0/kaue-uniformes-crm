/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0F172A',
        card: '#1E293B',
        'card-hover': '#263548',
        primary: '#1E3A8A',
        'primary-light': '#2563EB',
        accent: '#D97706',
        'accent-light': '#F59E0B',
      },
    },
  },
  plugins: [],
}
