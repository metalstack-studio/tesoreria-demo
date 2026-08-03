// ============================================================
//  routes/chat.js · Endpoint del chatbot (protegido con JWT)
// ============================================================

import { Router } from 'express';
import { askAssistant } from '../services/aiAssistant.js';
import { config } from '../config.js';

export const chatRouter = Router();

// POST /api/chat   body: { message: "¿cuál es mi saldo en dólares?" }
chatRouter.post('/', async (req, res, next) => {
  try {
    const { message } = req.body || {};

    // --- Validación de input ---
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Falta "message" (la pregunta)' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'La pregunta es demasiado larga (máx 500 caracteres)' });
    }

    // --- Chequeo de configuración: ¿hay API key del LLM? ---
    if (!config.llm.apiKey) {
      return res.status(503).json({
        error: 'El asistente no está configurado: falta LLM_API_KEY en backend/.env',
      });
    }

    // req.user.id viene del token (lo puso el middleware authRequired).
    const answer = await askAssistant(req.user.id, message.trim());

    res.json({ answer });
  } catch (err) {
    // Errores propios de la API de OpenAI (ej: key inválida, sin crédito).
    if (err?.status === 401) {
      return res.status(502).json({ error: 'La API key de OpenAI es inválida' });
    }
    if (err?.status === 429) {
      return res.status(502).json({ error: 'Límite de OpenAI alcanzado (rate limit o sin crédito)' });
    }
    next(err); // cualquier otra cosa → manejador central
  }
});
