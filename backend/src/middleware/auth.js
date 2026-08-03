// ============================================================
//  middleware/auth.js · Protege rutas verificando el JWT
// ============================================================

import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Un "middleware" es una función (req, res, next):
//  - req  = el pedido que llega
//  - res  = la respuesta que vamos a mandar
//  - next = "seguí adelante" (llamar al siguiente paso / al handler)
//
// Si el token es válido, llamamos next() y la petición continúa.
// Si no, respondemos 401 (No autorizado) y cortamos acá.
export function authRequired(req, res, next) {
  // El estándar es mandar el token así:  Authorization: Bearer <token>
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Falta el token de autenticación' });
  }

  try {
    // jwt.verify hace dos cosas:
    //  1) comprueba que la FIRMA coincide con nuestro JWT_SECRET
    //     (si alguien tocó el token, falla)
    //  2) comprueba que no esté vencido (exp)
    const payload = jwt.verify(token, config.jwtSecret);

    // Guardamos los datos del usuario en req.user para que los
    // handlers de las rutas sepan QUIÉN está haciendo el pedido.
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
