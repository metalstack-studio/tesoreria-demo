// ============================================================
//  App.jsx · Componente raíz: decide Login vs Dashboard
// ============================================================

import { useState } from 'react';
import { getToken, setToken, clearToken } from './api.js';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  // ESTADO: ¿tenemos token? Lo inicializamos leyendo localStorage,
  // así si ya estabas logueado y recargás, seguís adentro.
  const [token, setTokenState] = useState(getToken());

  // Cuando el Login tiene éxito, guarda el token (localStorage + estado).
  // Cambiar el estado hace que React vuelva a dibujar → aparece el Dashboard.
  function handleLogin(newToken) {
    setToken(newToken);
    setTokenState(newToken);
  }

  function handleLogout() {
    clearToken();
    setTokenState(null);
  }

  // Renderizado condicional: sin token → Login; con token → Dashboard.
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }
  return <Dashboard onLogout={handleLogout} />;
}
