/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  // prettier-plugin-tailwindcss DEBE ir el ÚLTIMO del array (§4). `tailwindStylesheet`
  // apunta al CSS que importa Tailwind v4 para que el plugin resuelva el orden de clases.
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  tailwindStylesheet: './src/styles/global.css',
  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
  ],
};
