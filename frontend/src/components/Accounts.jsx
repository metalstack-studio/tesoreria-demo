// ============================================================
//  Accounts.jsx · Muestra las cuentas del usuario
// ============================================================

import { useState, useEffect } from 'react';
import { api } from '../api.js';

// Formatea un número como moneda (ej: 128940.2 -> "128.940,20").
function formatMoney(value, currency) {
  const n = Number(value);
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n) + ' ' + currency;
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // useEffect con [] = "corré esto UNA vez, cuando el componente aparece".
  // Es el lugar típico para pedir datos al backend al montar la pantalla.
  useEffect(() => {
    api
      .getAccounts()
      .then((data) => setAccounts(data.accounts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Cargando cuentas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2 className="section-title">Mis cuentas</h2>
      <div className="accounts-list">
        {accounts.map((acc) => (
          <div key={acc.id} className="card account-card">
            <div className="account-name">{acc.name}</div>
            <div className="account-balance">{formatMoney(acc.balance, acc.currency)}</div>
            <div className="account-currency">{acc.currency}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
