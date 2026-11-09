/** @type {import("prettier").Config} */
export default {
  singleQuote: true,
  // The Tailwind plugin must come last.
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  tailwindStylesheet: './src/styles/global.css',
};
