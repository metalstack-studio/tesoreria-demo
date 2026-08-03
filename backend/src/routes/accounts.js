// ============================================================
//  routes/accounts.js · Listar cuentas del usuario logueado
// ============================================================

import { Router } from 'express';
import { query } from '../db.js';

export const accountsRouter = Router();

// GET /api/accounts
// (Esta ruta va protegida con authRequired en index.js, así que
//  cuando llega acá ya tenemos req.user cargado por el middleware.)
accountsRouter.get('/', async (req, res, next) => {
  try {
    // Filtramos por el user_id que viene DEL TOKEN, no de un parámetro
    // que mande el cliente. Un usuario solo ve SUS cuentas.
    const result = await query(
      `SELECT id, name, currency, balance, created_at
         FROM accounts
        WHERE user_id = $1
        ORDER BY id`,
      [req.user.id]
    );
    res.json({ accounts: result.rows });
  } catch (err) {
    next(err);
  }
});
