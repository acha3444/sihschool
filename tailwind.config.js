/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // maintained for safety, but app is light-only
  theme: {
    extend: {
      colors: {
        sky: {
          pastel: '#A9D8F5',
          light: '#CDE9FA',
          soft: '#BAE2F8',
        },
        cream: {
          DEFAULT: '#FFF6E3',
          card: '#FFF6E3',
          hover: '#FFF0D4',
          dark: '#F5E7CD',
        },
        navy: {
          DEFAULT: '#1B2A7A',
          dark: '#121C53',
          text: '#1B2A7A',
          secondary: '#4A5487',
          muted: '#6E78A8',
        },
        lavender: {
          DEFAULT: '#CDBDF2',
          pill: '#CDBDF2',
          light: '#E6DEFA',
          dark: '#B09BDD',
        },
        sun: {
          DEFAULT: '#FFE15C',
          hover: '#FBD745',
          light: '#FFF0A8',
        },
        arabic: {
          red: '#E5483D',
          blue: '#2F5BD1',
        },
      },
      fontFamily: {
        sans: ['"Baloo 2"', 'Inter', 'sans-serif'],
        baloo: ['"Baloo Bhaijaan 2"', '"Baloo 2"', 'cursive', 'sans-serif'],
        arabic: ['"Baloo Bhaijaan 2"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '26px',
        '4xl': '32px',
        'cloud': '30px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft-blue': '0 10px 25px -5px rgba(27, 42, 122, 0.08), 0 8px 10px -6px rgba(27, 42, 122, 0.04)',
        'sun-glow': '0 6px 20px rgba(255, 225, 92, 0.45)',
        'lavender-glow': '0 6px 20px rgba(205, 189, 242, 0.45)',
        'cloud-pop': '0 12px 30px -4px rgba(27, 42, 122, 0.10)',
      },
      animation: {
        'float-slow': 'floatCloud 6s ease-in-out infinite',
        'float-delayed': 'floatCloud 7s ease-in-out 2s infinite',
        'sun-pulse': 'sunPulse 3s ease-in-out infinite',
      },
      keyframes: {
        floatCloud: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        sunPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        }
      }
    },
  },
  plugins: [],
}
