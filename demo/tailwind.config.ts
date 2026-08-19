import base from '../tailwind.config';
import type { Config } from 'tailwindcss';

const config: Config = {
  ...base,
  content: ['./src/**/*.{ts,tsx}', './demo/**/*.{ts,tsx}'],
};

export default config;
