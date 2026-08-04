// ============================================================
//  Chat.jsx · Interfaz de conversación con el asistente de IA
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';

// Preguntas sugeridas para arrancar (mejora la UX).
const SUGGESTIONS = [
  '¿Cuál es mi saldo total en dólares?',
  'Mostrame los últimos 5 movimientos',
  '¿Cuánto gasté en pagos a proveedores?',
];

export default function Chat() {
  // La conversación es un array de mensajes: { role, text }.
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Preguntame sobre tus cuentas y movimientos.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Cada vez que cambian los mensajes, scrolleamos al último.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text) {
    const pregunta = text.trim();
    if (!pregunta || loading) return;

    // El historial que le mandamos al backend = la conversación hasta ahora,
    // sin los mensajes de error. Esto le da MEMORIA al asistente.
    const history = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, text: m.text }));

    // 1) Mostramos enseguida el mensaje del usuario.
    setMessages((prev) => [...prev, { role: 'user', text: pregunta }]);
    setInput('');
    setLoading(true);

    try {
      // 2) Llamamos al backend (que consulta la DB + OpenRouter),
      //    pasándole el historial para que "recuerde" la charla.
      const data = await api.chat(pregunta, history);
      // 3) Agregamos la respuesta del asistente.
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '⚠️ ' + err.message, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat">
      <h2 className="section-title">Asistente</h2>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role} ${m.isError ? 'msg-error' : ''}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg msg-assistant typing">Pensando…</div>}
        <div ref={bottomRef} />
      </div>

      {/* Sugerencias (solo al inicio, cuando hay poca conversación) */}
      {messages.length <= 1 && (
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          type="text"
          placeholder="Escribí tu pregunta…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
}
