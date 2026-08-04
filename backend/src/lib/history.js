// ============================================================
//  lib/history.js · Normaliza el historial de conversación
// ============================================================
//  Función PURA (sin efectos secundarios): misma entrada -> misma
//  salida, no toca base ni red. Por eso es fácil de testear.
// ============================================================

// Cuántos mensajes previos recordamos (para no gastar tokens de más).
export const MAX_HISTORY = 10;

// Convierte el historial que manda el frontend a un formato seguro para
// la API del modelo: solo roles válidos, texto acotado, y como mucho
// los últimos `max` mensajes.
export function normalizarHistorial(history, max = MAX_HISTORY) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.text === 'string'
    )
    .slice(-max)
    .map((m) => ({ role: m.role, content: m.text.slice(0, 2000) }));
}
