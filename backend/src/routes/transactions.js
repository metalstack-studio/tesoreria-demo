// ============================================================
//  routes/transactions.js · Listar movimientos del usuario
// ============================================================

import { Router } from 'express';
import { query } from '../db.js';

export const transactionsRouter = Router();

// GET /api/transactions
//   ?account_id=2   (opcional) filtra por una cuenta
//   ?limit=5        (opcional) cuántos traer (por defecto 50, máx 100)
transactionsRouter.get('/', async (req, res, next) => {
  try {
    const { account_id } = req.query;

    // Saneamos el límite: número, con tope, para no permitir consultas gigantes.
    let limit = parseInt(req.query.limit, 10);
    if (Number.isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;

    // JOIN con accounts para poder filtrar por a.user_id: así, aunque
    // el cliente pase un account_id que no es suyo, no ve nada ajeno.
    const params = [req.user.id];
    let sql = `
      SELECT t.id, t.account_id, a.name AS account_name, a.currency,
             t.type, t.amount, t.description, t.occurred_at
        FROM transactions t
        JOIN accounts a ON a.id = t.account_id
       WHERE a.user_id = $1`;

    // Si mandaron account_id, lo agregamos como filtro extra parametrizado.
    if (account_id) {
      params.push(account_id);
      sql += ` AND t.account_id = $${params.length}`;
    }

    // Orden: más recientes primero. El límite va como último parámetro.
    params.push(limit);
    sql += ` ORDER BY t.occurred_at DESC LIMIT $${params.length}`;

    const result = await query(sql, params);
    res.json({ transactions: result.rows });
  } catch (err) {
    next(err);
  }
});
