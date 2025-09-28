/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: 'hsl(134, 61%, 41%)',  // Dark green - primary
          600: 'hsl(134, 61%, 51%)',  // Light green - hover
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, hsl(134, 61%, 41%), hsl(134, 61%, 51%))',
        'primary-gradient-hover': 'linear-gradient(135deg, hsl(134, 61%, 51%), hsl(134, 61%, 41%))',
      }
    },
  },
  plugins: [],
}