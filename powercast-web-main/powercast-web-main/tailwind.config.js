/** @type {import('tailwindcss').Config} */
// Modern Soft Minimal — Rounded Enterprise UI tokens (mirrors src/utils/theme.ts).
module.exports = {
  darkMode: 'class',
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#f5f7fb',
        surface: '#ffffff',
        'surface-muted': '#eef2f8',
        'surface-accent': '#eff5ff',
        border: '#e2e8f2',
        'border-strong': '#cbd5e4',
        ink: '#0f172a',
        'ink-secondary': '#334155',
        'ink-muted': '#526077',
        accent: {
          DEFAULT: '#1d4ed8',
          hover: '#1e40af',
          soft: '#eff6ff',
          foreground: '#ffffff',
        },
        teal: '#0d9488',
        violet: '#6d28d9',
        amber: '#b45309',
        danger: '#be123c',
      },
      fontFamily: {
        sans: ['Manrope_400Regular', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        medium: ['Manrope_500Medium', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        semibold: ['Manrope_600SemiBold', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        bold: ['Manrope_700Bold', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['JetBrainsMono_400Regular', '"SFMono-Regular"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        control: '14px',
        pill: '999px',
        '2xl': '20px',
        xl: '16px',
        lg: '14px',
        md: '12px',
        sm: '10px',
      },
    },
  },
  plugins: [],
};
