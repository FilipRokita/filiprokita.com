import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', '.astro/', '.lighthouseci/', 'plans/', 'dev-only/']),
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs['flat/recommended'],
  // Defined at build time in astro.config.mjs.
  { languageOptions: { globals: { __BUILD__: 'readonly' } } },
  {
    files: ['**/*.astro'],
    plugins: { 'jsx-a11y-x': jsxA11yX },
    rules: jsxA11yX.configs.recommended.rules,
  },
  {
    // Tool configs that LHCI loads with require().
    files: ['src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['astro.config.mjs', 'design/**/*.mjs', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);
