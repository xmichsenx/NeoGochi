/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neogochi: {
          bg: '#0f0f23',
          card: '#1a1a2e',
          accent: '#e94560',
          secondary: '#16213e',
          text: '#eaeaea',
          muted: '#8888aa',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
};
