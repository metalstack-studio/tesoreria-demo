// ============================================================
//  main.jsx · Punto de entrada de la app React
// ============================================================

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// Buscamos el <div id="root"> del index.html y "montamos" React ahí.
// A partir de este punto, React controla todo lo que se dibuja adentro.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
