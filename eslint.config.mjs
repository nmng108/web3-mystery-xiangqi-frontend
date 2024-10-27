import eslintJS from '@eslint/js';
import eslintTS from 'typescript-eslint';
import eslintConfigGoogle from 'eslint-config-google';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';

export default eslintTS.config(
  { ignores: ['dist', '.yarn', '**/.pnp.*'] },
  importPlugin.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslintJS.configs.recommended,
      ...eslintTS.configs.recommended,
      eslintConfigPrettier,
      // eslintConfigGoogle,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
      },
      parserOptions: {},
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prefer-const': 'warn',
    },
  }
);
