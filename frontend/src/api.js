// ============================================================
//  api.js · Único lugar que habla con el backend
// ============================================================
//  Centralizar los fetch acá tiene una ventaja enorme: el manejo
//  del token y de los errores vive en un solo lugar, no repartido
//  por todos los componentes.
// ============================================================

// La URL del backend sale de la variable de entorno VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// --- Manejo del token en localStorage (persiste entre recargas) ---
export function getToken() {
  return localStorage.getItem('token');
}
export function setToken(token) {
  localStorage.setItem('token', token);
}
export function clearToken() {
  localStorage.removeItem('token');
}

// --- Función base para todos los pedidos HTTP ---
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  // Si el pedido requiere autenticación, adjuntamos el JWT.
  // Esto es EXACTAMENTE lo que hacíamos a mano con curl:
  //   -H "Authorization: Bearer <token>"
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Intentamos parsear el JSON de la respuesta (aunque sea un error).
  const data = await res.json().catch(() => ({}));

  // Si el backend respondió con un código de error (4xx/5xx),
  // lanzamos una excepción con el mensaje que él nos mandó.
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

// --- API pública: un método por endpoint ---
export const api = {
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false }),

  getAccounts: () => request('/api/accounts'),

  getTransactions: (query = '') => request(`/api/transactions${query}`),

  chat: (message, history = []) =>
    request('/api/chat', { method: 'POST', body: { message, history } }),
};
