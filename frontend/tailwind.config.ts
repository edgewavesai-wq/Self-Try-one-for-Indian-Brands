import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B1F3B',
        gold: '#CFB53B',
        cream: '#FAF7F0',
        charcoal: '#2D2D2D',
        burgundy: '#800020',
        emerald: '#2E7D5B',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'paisley': "url('/patterns/paisley.svg')",
      },
    },
  },
  plugins: [],
}
export default config
