import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#080808',
        surface: '#0f0f0f',
        surface2: '#141414',
        border: '#1a1a1a',
        'border-hover': '#2a2a2a',
        accent: {
          green: '#00FF88',
          'green-hover': '#00E077',
          'green-dim': '#00FF8818',
          'green-border': '#00FF8830',
          yellow: '#F5C518',
          red: '#FF3B3B',
          orange: '#FF6B2B',
        },
        text: {
          primary: '#F0F0F0',
          secondary: '#888888',
          muted: '#444444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.35s ease-out forwards',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'data-in': 'dataIn 0.2s ease-out forwards',
        'spin-slow': 'spin 2s linear infinite',
        scan: 'scanLine 8s linear infinite',
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px #00FF8830' },
          '50%': { boxShadow: '0 0 24px #00FF8870, 0 0 48px #00FF8828' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        dataIn: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        statusPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      boxShadow: {
        'green-sm': '0 0 8px #00FF8830',
        'green-md': '0 0 20px #00FF8840',
        'green-lg': '0 0 40px #00FF8850',
        card: '0 1px 3px rgba(0,0,0,0.5)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
} satisfies Config;
