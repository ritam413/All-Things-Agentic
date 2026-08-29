/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bricolage-grotesque)', 'Bricolage Grotesque', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'Roboto Mono', 'monospace'],
      },
      colors: {
        'forest-ink': '#1a3300',
        'highlighter-yellow': '#ffe95c',
        'cream-paper': '#fcfaf5',
        'pencil-gray': '#b6b6b6',
        'whisper-gray': '#f1f1f1',
        'sticky-note-teal': '#a8e5e5',
        'sticky-note-mint': '#d5f5c2',
        'sticky-note-blush': '#f6d0ff',
        'terracotta': '#cb5521',
      },
      borderRadius: {
        'btn': '6px',
        'card': '12px',
        'nav': '16px',
      },
      boxShadow: {
        'subtle': 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
        'subtle-2': 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px',
      },
    },
  },
  plugins: [],
}
