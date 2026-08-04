// ============================================================
//  eslint.config.js · Reglas de ESLint para el frontend (React)
// ============================================================

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist'] }, // no lintear la carpeta de build
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser }, // reconoce window, document, fetch, etc.
      parserOptions: {
        ecmaFeatures: { jsx: true }, // habilita parsear JSX
      },
    },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      // Hace que un <Componente /> en JSX cuente como "uso" de la variable
      // (si no, ESLint cree que los imports de componentes no se usan).
      'react/jsx-uses-vars': 'error',
      'react/jsx-uses-react': 'off', // con Vite/React 18 no hace falta importar React para el JSX
      // Reglas clave de React: usar hooks bien y declarar dependencias.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
];
