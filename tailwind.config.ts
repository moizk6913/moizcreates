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
          red: '#e60000',
        },
        border: {
          hairline: '#e8e6e1',
          medium: '#d3d0c8',
        },
      },
      fontFamily: {
        sans: ["'Britti Sans'", 'var(--font-inter)', 'sans-serif'],
        britti: ["'Britti Sans'", 'sans-serif'],
        mono: ["'Nitti Typewriter'", 'var(--font-dm-mono)', 'var(--font-space-mono)', 'monospace'],
        nitti: ["'Nitti Typewriter'", 'monospace'],
        typewriter: ["'Nitti Typewriter'", 'monospace'],
        display: ["'DharmaGothicE_Bold_R'", "'Britti Sans'", 'var(--font-archivo-black)', 'sans-serif'],
        syne: ['var(--font-syne)', 'sans-serif'],
        monument: ['var(--font-archivo-black)', 'sans-serif'],
        grotesk: ["'Britti Sans'", 'var(--font-plus-jakarta)', 'sans-serif'],
        dharma: ["'DharmaGothicE_Bold_R'", "'Dharma Gothic'", 'sans-serif'],
        condensed: ["'DharmaGothicE_Bold_R'", "'Dharma Gothic'", 'sans-serif'],
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
