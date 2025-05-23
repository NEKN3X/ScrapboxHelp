import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import ts from 'typescript-eslint';

export default defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  eslintConfigPrettier,
]);
