// ============================================================
//  vite.config.js · Configuración de Vite (el "motor" del frontend)
// ============================================================
//  Vite hace dos cosas: (1) un servidor de desarrollo con recarga
//  instantánea (HMR), y (2) el "build" que empaqueta todo para prod.
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // El plugin de React habilita JSX y el Fast Refresh (recarga en caliente).
  plugins: [react()],
  server: {
    port: 5199,        // puerto del frontend en desarrollo
    strictPort: true,  // si está ocupado, falla en vez de cambiar solo
  },
});
