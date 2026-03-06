import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        surface: '#141414',
        'surface-hover': '#1C1C1C',
        border: '#262626',
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-tertiary': '#52525B',
        accent: '#10B981',
        'accent-hover': '#059669',
        'accent-soft': 'rgba(16, 185, 129, 0.08)',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
