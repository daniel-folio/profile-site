import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        'primary-gradient-start': '#5D5FEF',
        'primary-gradient-end': '#E15A8B',
      },
      typography: {
        DEFAULT: {
          css: {
            'u': { 'text-decoration': 'underline' },
            's, del': { 'text-decoration': 'line-through' },
            'mark': { 'background-color': '#fff3cd', 'color': '#856404' },
            'span[style*="color"]': { 'color': 'inherit' },
            'code': { 'background-color': '#f3f4f6', 'padding': '2px 4px', 'border-radius': '4px', 'font-size': '0.95em' },
            'pre': { 'background-color': '#f3f4f6', 'padding': '12px', 'border-radius': '8px' },
          }
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}
export default config 