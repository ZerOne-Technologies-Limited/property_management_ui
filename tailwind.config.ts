import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        stripe: {
          purple: '#635BFF',
          'purple-light': '#F0F0FF',
          header: '#1A2B42',
          sidebar: '#F0F2F5',
          'text-primary': '#30313F',
          'text-secondary': '#6B7A8C',
          border: '#E0E0E0',
          banner: '#ECF0FF',
          'banner-text': '#4B5263',
        },
      },
    },
  },
} satisfies Config
