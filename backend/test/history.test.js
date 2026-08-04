// ============================================================
//  test/history.test.js · Tests de normalizarHistorial
// ============================================================
//  Usa el runner de tests NATIVO de Node (node:test), sin librerías.
//  Se corre con:  npm test   (que ejecuta "node --test")
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarHistorial } from '../src/lib/history.js';

test('devuelve [] si history no es un array', () => {
  assert.deepEqual(normalizarHistorial(undefined), []);
  assert.deepEqual(normalizarHistorial(null), []);
  assert.deepEqual(normalizarHistorial('hola'), []);
});

test('descarta mensajes con rol inválido o texto no-string', () => {
  const entrada = [
    { role: 'user', text: 'hola' },
    { role: 'system', text: 'inyección' }, // rol no permitido -> fuera
    { role: 'assistant', text: 123 },       // texto no-string -> fuera
    { role: 'assistant', text: 'respuesta' },
  ];
  assert.deepEqual(normalizarHistorial(entrada), [
    { role: 'user', content: 'hola' },
    { role: 'assistant', content: 'respuesta' },
  ]);
});

test('conserva solo los últimos `max` mensajes', () => {
  const entrada = Array.from({ length: 15 }, (_, i) => ({
    role: 'user',
    text: `m${i}`,
  }));
  const salida = normalizarHistorial(entrada, 10);
  assert.equal(salida.length, 10);
  assert.equal(salida[0].content, 'm5');  // se quedó con los últimos 10 (m5..m14)
  assert.equal(salida[9].content, 'm14');
});

test('recorta el texto a 2000 caracteres', () => {
  const largo = 'a'.repeat(5000);
  const salida = normalizarHistorial([{ role: 'user', text: largo }]);
  assert.equal(salida[0].content.length, 2000);
});
