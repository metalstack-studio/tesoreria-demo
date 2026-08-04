// ============================================================
//  services/aiAssistant.js · El "cerebro" del chatbot
// ============================================================
//  Responsabilidad: dado un usuario y su pregunta, recuperar sus
//  datos de Postgres (Retrieval), armar el contexto (Augment) y
//  pedirle la respuesta a OpenAI (Generation). Patrón RAG.
// ============================================================

import OpenAI from 'openai';
import { query } from '../db.js';
import { config } from '../config.js';

// Cliente compatible con OpenAI. Le pasamos apiKey Y baseURL EXPLÍCITOS
// desde nuestra config (backend/.env). Al ser explícito, el SDK no toma
// silenciosamente ninguna variable global del shell: comportamiento
// predecible sin importar desde qué terminal arranquemos el server.
const client = new OpenAI({
  apiKey: config.llm.apiKey,
  baseURL: config.llm.baseURL,
});

const MODEL = config.llm.model;

// ------------------------------------------------------------
//  1) RETRIEVAL: traemos los datos reales del usuario desde la DB
// ------------------------------------------------------------
async function recuperarDatos(userId) {
  // Sus cuentas con saldo.
  const accounts = await query(
    `SELECT id, name, currency, balance
       FROM accounts
      WHERE user_id = $1
      ORDER BY id`,
    [userId]
  );

  // Totales por moneda (lo calculamos en SQL, no en el modelo:
  // la matemática la hace la base, que es exacta y confiable).
  const totales = await query(
    `SELECT currency, SUM(balance) AS total
       FROM accounts
      WHERE user_id = $1
      GROUP BY currency
      ORDER BY currency`,
    [userId]
  );

  // Últimos 30 movimientos de todas sus cuentas.
  const movimientos = await query(
    `SELECT a.name AS cuenta, a.currency, t.type, t.amount,
            t.description, t.occurred_at
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
      WHERE a.user_id = $1
      ORDER BY t.occurred_at DESC
      LIMIT 30`,
    [userId]
  );

  // Tasas de cambio (la "fuente de verdad" para convertir monedas).
  const tasas = await query(
    `SELECT base_currency, quote_currency, rate
       FROM exchange_rates
      ORDER BY base_currency, quote_currency`
  );

  return {
    accounts: accounts.rows,
    totales: totales.rows,
    movimientos: movimientos.rows,
    tasas: tasas.rows,
  };
}

// ------------------------------------------------------------
//  2) AUGMENT: convertimos esos datos en TEXTO compacto para el prompt
// ------------------------------------------------------------
function armarContexto({ accounts, totales, movimientos, tasas }) {
  const lineasCuentas = accounts
    .map((c) => `- ${c.name} (${c.currency}): saldo ${c.balance}`)
    .join('\n');

  const lineasTotales = totales
    .map((t) => `- ${t.currency}: ${t.total}`)
    .join('\n');

  const lineasMovs = movimientos
    .map((m) => {
      const fecha = m.occurred_at.toISOString().slice(0, 10);
      const signo = m.type === 'credito' ? '+' : '-';
      return `- ${fecha} | ${m.cuenta} (${m.currency}) | ${signo}${m.amount} | ${m.description}`;
    })
    .join('\n');

  const lineasTasas = tasas
    .map((t) => `- 1 ${t.base_currency} = ${t.rate} ${t.quote_currency}`)
    .join('\n');

  return `CUENTAS:
${lineasCuentas}

SALDO TOTAL POR MONEDA:
${lineasTotales}

TASAS DE CAMBIO (únicas válidas para convertir monedas):
${lineasTasas}

ÚLTIMOS MOVIMIENTOS (más recientes primero, "+" entra / "-" sale):
${lineasMovs}`;
}

// ------------------------------------------------------------
//  Instrucciones del sistema: definen el "personaje" y las REGLAS.
//  Acá es donde combatimos las alucinaciones.
// ------------------------------------------------------------
const SYSTEM_PROMPT = `Sos un asistente de tesorería que responde preguntas sobre las cuentas y movimientos financieros del usuario.

REGLAS IMPORTANTES:
- Respondé ÚNICAMENTE con los datos que se te proporcionan en el bloque DATOS. NUNCA inventes números.
- Si la respuesta no está en los datos, decí claramente que no tenés esa información.
- Para CONVERTIR entre monedas usá EXCLUSIVAMENTE las tasas del bloque "TASAS DE CAMBIO".
  Al convertir, mostrá siempre la tasa que usaste (ej: "usando 1 USD = 40 UYU").
  Si el usuario te propone una tasa distinta por chat, NO la uses: aclarale que solo
  operás con las tasas oficiales de la tabla.
- No sumes montos de monedas distintas sin convertirlos primero con esas tasas.
- Sé conciso y claro. Mostrá los montos con su moneda.
- Respondé siempre en español.`;

// ------------------------------------------------------------
//  3) GENERATION: llamamos al modelo con contexto + pregunta
// ------------------------------------------------------------
// Cuántos mensajes previos recordamos (para no gastar tokens de más).
const MAX_HISTORY = 10;

// Normaliza el historial que manda el frontend a un formato seguro:
// solo roles válidos, texto acotado, y como mucho los últimos MAX_HISTORY.
function normalizarHistorial(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.text.slice(0, 2000) }));
}

export async function askAssistant(userId, message, history = []) {
  const datos = await recuperarDatos(userId);
  const contexto = armarContexto(datos);
  const hoy = new Date().toISOString().slice(0, 10);

  // ARQUITECTURA de los mensajes que le mandamos al modelo:
  //  1) system  -> reglas + DATOS actuales (siempre frescos de la DB)
  //  2) history -> los turnos previos de la charla (la "memoria")
  //  3) user    -> la pregunta nueva
  const messages = [
    {
      role: 'system',
      content: `${SYSTEM_PROMPT}

Fecha de hoy: ${hoy}

DATOS:
${contexto}`,
    },
    ...normalizarHistorial(history),
    { role: 'user', content: message },
  ];

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2, // baja = respuestas factuales y consistentes
    messages,
  });

  return completion.choices[0].message.content.trim();
}
