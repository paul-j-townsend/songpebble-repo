import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: {
            DEFAULT: '#C41E3A',
            light: '#DC143C',
            dark: '#8B0000',
          },
          green: {
            DEFAULT: '#165B33',
            light: '#2D8659',
            dark: '#0B4025',
          },
          gold: {
            DEFAULT: '#FFD700',
            light: '#FFE44D',
            dark: '#DAA520',
          },
          snow: {
            DEFAULT: '#F8FAFC',
            light: '#FFFFFF',
            dark: '#E2E8F0',
          },
        },
      },
      keyframes: {
        snowfall: {
          '0%': { transform: 'translateY(-10vh) translateX(0)' },
          '100%': { transform: 'translateY(100vh) translateX(100px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.2) rotate(180deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' },
          '50%': { boxShadow: '0 0 20px 5px rgba(255, 215, 0, 0.4)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        snowfall: 'snowfall linear infinite',
        sparkle: 'sparkle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
