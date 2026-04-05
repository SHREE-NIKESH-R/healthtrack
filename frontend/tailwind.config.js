/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        primary: {
          DEFAULT: '#4A6DB5',
          50: '#EEF2FB',
          100: '#D5E0F5',
          200: '#AABFEB',
          300: '#7F9EE1',
          400: '#5580D8',
          500: '#4A6DB5',
          600: '#3B5791',
          700: '#2C416D',
          800: '#1E2B49',
          900: '#0F1624'
        },
        canvas: '#F8F9FA',
        surface: '#FFFFFF',
        ink: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50:  '#F8FAFC'
        },
        border: '#E2E8F0',
        // Metric colors
        sleep:     '#7B68EE',
        heart:     '#E74C3C',
        activity:  '#3A9B6E',
        hydration: '#4A9BD5',
        screen:    '#C0622A',
        // Dark mode surfaces
        dark: {
          canvas:  '#0F172A',
          surface: '#1E293B',
          card:    '#263348',
          border:  '#334155'
        }
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        lifted: '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        float:  '0 16px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)',
        glow:   '0 0 24px rgba(74,109,181,0.25)'
      },
      borderRadius: {
        card: '12px',
        xl:   '16px',
        '2xl':'20px',
        '3xl':'24px'
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' }
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' }
        }
      },
      animation: {
        'fade-up':    'fade-up 0.4s ease-out forwards',
        shimmer:      'shimmer 1.8s infinite linear',
        float:        'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse2 2s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
