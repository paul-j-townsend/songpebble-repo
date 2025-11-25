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
    },
  },
  plugins: [],
};
export default config;
