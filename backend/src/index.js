// ============================================================
//  index.js · Punto de entrada del backend (arranca Express)
// ============================================================

import express from 'express';
import cors from 'cors';

import { config } from './config.js';
import { authRequired } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { accountsRouter } from './routes/accounts.js';
import { transactionsRouter } from './routes/transactions.js';
import { chatRouter } from './routes/chat.js';

const app = express();

// --- Middlewares globales (corren para TODAS las peticiones) ---
// CORS: permite que el frontend (que corre en otro puerto, ej 5173)
//       pueda llamar a esta API desde el navegador.
app.use(cors());
// Parsea el body JSON de las peticiones y lo deja en req.body.
app.use(express.json());

// --- Ruta de salud (health check), pública ---
// Sirve para comprobar rápido "¿el server está vivo?".
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'tesoreria-backend' });
});

// --- Rutas PÚBLICAS (no requieren token) ---
app.use('/api/auth', authRouter);

// --- Rutas PROTEGIDAS ---
// Poner authRequired ANTES del router hace que TODO lo que cuelgue
// de ahí exija un JWT válido. Si falta o es inválido, ni llega al router.
app.use('/api/accounts', authRequired, accountsRouter);
app.use('/api/transactions', authRequired, transactionsRouter);
app.use('/api/chat', authRequired, chatRouter);

// --- 404: ninguna ruta coincidió ---
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// --- Manejador CENTRAL de errores ---
// Cualquier next(err) de las rutas termina acá. Un solo lugar para
// loguear el error real y responder algo genérico al cliente.
app.use((err, req, res, next) => {
  console.error('💥 Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(config.port, () => {
  console.log(`✅ Backend escuchando en http://localhost:${config.port}`);
});
