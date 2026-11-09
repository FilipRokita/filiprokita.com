import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import jsxA11yX from 'eslint-plugin-jsx-a11y-x';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', '.astro/', '.lighthouseci/', 'plans/', 'dev-only/']),
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    plugins: { 'jsx-a11y-x': jsxA11yX },
    rules: jsxA11yX.configs.recommended.rules,
  },
]);
