import type { Config } from 'tailwindcss';

// Paleta oficial ROFÉ (Manual de Identidad Corporativa 2025, DE-004-M v03)
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rofe: {
          amarillo: '#EEC935',
          naranja: '#D1793F',
          rojo: '#C12D4C',
          azul: '#406C9E', // marca — no usar en marcas de datos (falla croma CVD)
          verde: '#6EA050',
          azul2: '#6FA0BC',
          azul3: '#83B6DD',
        },
      },
      fontFamily: {
        sans: ['"Century Gothic"', 'CenturyGothic', 'AppleGothic', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
