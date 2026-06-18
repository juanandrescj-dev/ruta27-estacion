// ESLint flat config (ESLint 9) — §4 del PLAN.
// Cubre TypeScript, plantillas .astro (eslint-plugin-astro) y accesibilidad:
//  - jsx-a11y para las islas React (.jsx/.tsx)
//  - el set jsx-a11y de eslint-plugin-astro para las plantillas .astro
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/', '.astro/', 'node_modules/', '.husky/', 'public/', 'pnpm-lock.yaml'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  // Plantillas .astro
  ...eslintPluginAstro.configs['flat/recommended'],
  ...eslintPluginAstro.configs['flat/jsx-a11y-recommended'],
  // Islas React (.jsx/.tsx): accesibilidad con jsx-a11y
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  // Archivos de configuración y scripts que corren en Node
  {
    files: ['*.{js,mjs,cjs,ts}', '**/*.config.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // Scripts de cliente (motion, etc.): se ejecutan en el navegador.
  {
    files: ['src/scripts/**/*.{ts,js}'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
);
