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

// Cliente de OpenAI. La API key sale del entorno (backend/.env),
// NUNCA hardcodeada en el código.
const client = new OpenAI({ apiKey: config.openaiApiKey });

const MODEL = 'gpt-4o-mini';

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

  return {
    accounts: accounts.rows,
    totales: totales.rows,
    movimientos: movimientos.rows,
  };
}

// ------------------------------------------------------------
//  2) AUGMENT: convertimos esos datos en TEXTO compacto para el prompt
// ------------------------------------------------------------
function armarContexto({ accounts, totales, movimientos }) {
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

  return `CUENTAS:
${lineasCuentas}

SALDO TOTAL POR MONEDA:
${lineasTotales}

ÚLTIMOS MOVIMIENTOS (más recientes primero, "+" entra / "-" sale):
${lineasMovs}`;
}

// ------------------------------------------------------------
//  Instrucciones del sistema: definen el "personaje" y las REGLAS.
//  Acá es donde combatimos las alucinaciones.
// ------------------------------------------------------------
const SYSTEM_PROMPT = `Sos un asistente de tesorería que responde preguntas sobre las cuentas y movimientos financieros del usuario.

REGLAS IMPORTANTES:
- Respondé ÚNICAMENTE con los datos que se te proporcionan en el bloque DATOS.
- Si la respuesta no está en los datos, decí claramente que no tenés esa información. NUNCA inventes números.
- No mezcles montos de monedas distintas (USD, UYU y EUR son diferentes; no los sumes entre sí).
- Sé conciso y claro. Mostrá los montos con su moneda.
- Respondé siempre en español.`;

// ------------------------------------------------------------
//  3) GENERATION: llamamos al modelo con contexto + pregunta
// ------------------------------------------------------------
export async function askAssistant(userId, message) {
  const datos = await recuperarDatos(userId);
  const contexto = armarContexto(datos);

  const hoy = new Date().toISOString().slice(0, 10);

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2, // baja = respuestas factuales y consistentes
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Fecha de hoy: ${hoy}

DATOS:
${contexto}

PREGUNTA DEL USUARIO:
${message}`,
      },
    ],
  });

  // La respuesta del modelo viene en choices[0].message.content.
  return completion.choices[0].message.content.trim();
}
