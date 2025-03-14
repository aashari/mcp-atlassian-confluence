import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'prettier': prettier
    },
    rules: {
      'no-console': 'off',
      'prettier/prettier': 'error'
    },
    ignores: ['dist/**', 'node_modules/**'],
  },
  eslintConfigPrettier
]; 