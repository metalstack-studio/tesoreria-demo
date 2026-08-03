// ============================================================
//  routes/auth.js · Registro y login (devuelve un JWT)
// ============================================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { config } from '../config.js';

export const authRouter = Router();

// --- Helper: crea un token JWT firmado para un usuario ---
function firmarToken(user) {
  // El "payload" son los datos que viajan DENTRO del token.
  // sub = subject (a quién pertenece el token). Nunca metemos la password.
  const payload = { sub: user.id, email: user.email };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

// ------------------------------------------------------------
//  POST /api/auth/register
// ------------------------------------------------------------
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body || {};

    // --- Validación básica de inputs ---
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Faltan campos: email, password y name son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // --- ¿Ya existe ese email? ---
    const existe = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    // --- Hasheamos la contraseña con bcrypt (cost factor 10) ---
    // bcrypt agrega un "salt" aleatorio y es lento a propósito:
    // así, aunque roben la base, no pueden revertir las contraseñas fácil.
    const passwordHash = await bcrypt.hash(password, 10);

    // --- Insertamos y devolvemos las columnas que nos interesan ---
    const result = await query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name`,
      [email, passwordHash, name]
    );
    const user = result.rows[0];

    // Devolvemos ya un token para que quede logueado tras registrarse.
    const token = firmarToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    next(err); // pasa el error al manejador central (index.js)
  }
});

// ------------------------------------------------------------
//  POST /api/auth/login
// ------------------------------------------------------------
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos: email y password' });
    }

    // Buscamos al usuario por email.
    const result = await query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    // Mensaje GENÉRICO a propósito: no revelamos si el problema fue
    // el email o la contraseña (no le damos pistas a un atacante).
    const credencialesInvalidas = () =>
      res.status(401).json({ error: 'Credenciales inválidas' });

    if (!user) return credencialesInvalidas();

    // Comparamos la contraseña recibida contra el hash guardado.
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return credencialesInvalidas();

    // Todo bien: firmamos y devolvemos el token (sin el password_hash).
    const token = firmarToken(user);
    return res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    next(err);
  }
});
