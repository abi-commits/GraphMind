/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Knowledge-focused color palette
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
          DEFAULT: 'hsl(var(--primary-600))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        
        secondary: {
          50: 'hsl(var(--secondary-50))',
          100: 'hsl(var(--secondary-100))',
          200: 'hsl(var(--secondary-200))',
          300: 'hsl(var(--secondary-300))',
          400: 'hsl(var(--secondary-400))',
          500: 'hsl(var(--secondary-500))',
          600: 'hsl(var(--secondary-600))',
          700: 'hsl(var(--secondary-700))',
          800: 'hsl(var(--secondary-800))',
          900: 'hsl(var(--secondary-900))',
          DEFAULT: 'hsl(var(--secondary-600))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        
        accent: {
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          200: 'hsl(var(--accent-200))',
          300: 'hsl(var(--accent-300))',
          400: 'hsl(var(--accent-400))',
          500: 'hsl(var(--accent-500))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          800: 'hsl(var(--accent-800))',
          900: 'hsl(var(--accent-900))',
          DEFAULT: 'hsl(var(--accent-500))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-foreground))'
        }
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-knowledge': 'linear-gradient(135deg, hsl(var(--primary-500)), hsl(var(--secondary-500)), hsl(var(--accent-500)))',
        'gradient-knowledge-dark': 'linear-gradient(135deg, hsl(var(--primary-700)), hsl(var(--secondary-700)), hsl(var(--accent-700)))',
        'mesh-gradient': 'conic-gradient(from 0deg at 50% 50%, hsl(var(--primary-500)), hsl(var(--secondary-500)), hsl(var(--accent-500)), hsl(var(--primary-500)))'
      },
      
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'theme-transition': 'theme-transition 0.3s ease-in-out'
      },
      
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          }
        },
        'glow': {
          '0%': { 'box-shadow': '0 0 5px hsl(var(--primary-500))' },
          '100%': { 'box-shadow': '0 0 20px hsl(var(--primary-500)), 0 0 30px hsl(var(--primary-500))' }
        },
        'theme-transition': {
          'from': { opacity: '0.8' },
          'to': { opacity: '1' }
        }
      },
      
      boxShadow: {
        'glow': '0 0 20px hsl(var(--primary-500) / 0.3)',
        'glow-lg': '0 0 30px hsl(var(--primary-500) / 0.4)',
        'knowledge': '0 4px 14px 0 hsl(var(--primary-500) / 0.15), 0 2px 4px 0 hsl(var(--primary-600) / 0.1)',
        'card-hover': '0 10px 25px hsl(var(--primary-500) / 0.1), 0 4px 6px hsl(var(--primary-600) / 0.05)'
      },
      
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke, box-shadow, transform'
      }
    }
  },
  plugins: [],
}