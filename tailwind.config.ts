import type { Config } from 'tailwindcss';

const config: Config = {
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
        fade: 'linear-gradient(to bottom, transparent, white)',
      },
      minWidth: {
        'screen-sm': '640px',
      },
      boxShadow: {
        long: `
        rgba(20, 20, 20, 1) 1px 1px,
        rgba(20, 20, 20, 1) 2px 2px,
        rgba(20, 20, 20, 1) 3px 3px,
        rgba(20, 20, 20, 1) 3px 3px,
        rgba(20, 20, 20, 1) 4px 4px,
        rgba(20, 20, 20, 1) 5px 5px,
        rgba(20, 20, 20, 1) 6px 6px,
        rgba(20, 20, 20, 1) 7px 7px`,
      },
    },
  },
  plugins: [],
};
export default config;
