import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        subtle: '#f8f7f5',
        primary: '#0d0d0e',
        secondary: '#585a62',
        muted: '#8c8f98',
        accent: {
          red: '#ff2a2a',
        },
        border: {
          hairline: '#e8e6e1',
          medium: '#d3d0c8',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ["'BN Cringe Sans'", "'BN Cringe Serif'", 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'var(--font-space-mono)', 'monospace'],
      },
      aspectRatio: {
        '21/9': '21 / 9',
        '16/11': '16 / 11',
        '16/10': '16 / 10',
        '4/5': '4 / 5',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [],
};

export default config;
