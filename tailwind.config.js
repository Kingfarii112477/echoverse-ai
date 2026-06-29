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
        // EchoVerse brand token system
        'ev-bg': '#0a1013',
        'ev-surface': '#131c1f',
        'ev-surface-container': '#1a2629',
        'ev-surface-high': '#223035',
        'ev-outline': '#3c494d',
        'ev-on-surface': '#dde4e6',
        'ev-on-surface-variant': '#859398',
        'ev-primary': '#06b6d4',          // cyan-500
        'ev-primary-container': '#0891b2', // cyan-600
        'ev-secondary': '#a855f7',         // purple-500
        'ev-tertiary': '#14b8a6',          // teal-500
        'ev-error': '#ef4444',
        'ev-warning': '#f59e0b',
        'ev-success': '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'waveform': 'waveform 1.2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4' },
          '100%': { boxShadow: '0 0 10px #06b6d4, 0 0 30px #06b6d4, 0 0 60px #06b6d4' },
        },
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'ev-gradient': 'linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #14b8a6 100%)',
        'ev-card': 'linear-gradient(145deg, #131c1f 0%, #1a2629 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
