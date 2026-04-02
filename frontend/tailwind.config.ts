import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        hub: {
          bg: '#020617',
          panel: '#0f172a',
          accent: '#22c55e',
          mist: '#38bdf8'
        }
      },
      boxShadow: {
        hub: '0 25px 80px -20px rgba(2,6,23,0.9)'
      }
    }
  },
  plugins: []
};

export default config;
