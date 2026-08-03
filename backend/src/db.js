// ============================================================
//  db.js · Conexión a PostgreSQL con la librería "pg"
// ============================================================

import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

// El POOL mantiene varias conexiones abiertas y las reutiliza.
// Abrir una conexión nueva por cada query sería lento; el pool
// las "presta" y las devuelve cuando terminamos.
export const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Helper para hacer consultas parametrizadas desde cualquier parte.
//
//   query('SELECT * FROM accounts WHERE user_id = $1', [userId])
//
// IMPORTANTE (seguridad): los valores van SIEMPRE por el segundo
// argumento (el array), NUNCA concatenados en el texto del SQL.
// Así "pg" los escapa y evitamos inyección SQL. Esto es lo mismo
// que los prepared statements que usabas en PHP con PDO.
export function query(text, params) {
  return pool.query(text, params);
}
