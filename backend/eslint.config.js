// ============================================================
//  eslint.config.js · Reglas de ESLint para el backend
// ============================================================
//  ESLint 9 usa "flat config" (este formato de array).
// ============================================================

import js from '@eslint/js';
import globals from 'globals';

export default [
  // Reglas recomendadas de ESLint (detectan errores comunes).
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node }, // reconoce process, console, etc.
    },
    rules: {
      // No molestar por argumentos de función sin usar (ej: el `next`
      // de Express, que a veces es obligatorio pero no se usa).
      'no-unused-vars': ['error', { args: 'none' }],
    },
  },
];
