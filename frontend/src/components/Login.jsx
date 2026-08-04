// ============================================================
//  Login.jsx · Formulario de acceso
// ============================================================

import { useState } from 'react';
import { api } from '../api.js';

// Recibe onLogin como "prop": una función que App nos pasa para
// avisarle "che, el login salió bien, acá está el token".
export default function Login({ onLogin }) {
  // Un estado por cada campo del formulario (formulario "controlado").
  const [email, setEmail] = useState('demo@tesoreria.com');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // evita que el navegador recargue la página
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLogin(data.token); // le pasamos el token a App
    } catch (err) {
      setError(err.message); // mostramos el error que devolvió el backend
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1 className="brand">💰 Tesorería</h1>
        <p className="subtitle">Asistente financiero con IA</p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="hint">Demo: demo@tesoreria.com / demo1234</p>
      </form>
    </div>
  );
}
