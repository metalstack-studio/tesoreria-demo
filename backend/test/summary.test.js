// ============================================================
//  test/summary.test.js · Tests de resumenPorMoneda
// ============================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { resumenPorMoneda } from '../src/lib/summary.js';

test('suma los saldos agrupando por moneda', () => {
  const cuentas = [
    { currency: 'USD', balance: '100.50' },
    { currency: 'USD', balance: '9.50' },
    { currency: 'EUR', balance: '40' },
  ];
  assert.deepEqual(resumenPorMoneda(cuentas), { USD: 110, EUR: 40 });
});

test('devuelve {} si la entrada no es un array', () => {
  assert.deepEqual(resumenPorMoneda(null), {});
  assert.deepEqual(resumenPorMoneda(undefined), {});
});

test('ignora cuentas sin moneda válida', () => {
  const cuentas = [{ balance: '10' }, { currency: 'USD', balance: '5' }];
  assert.deepEqual(resumenPorMoneda(cuentas), { USD: 5 });
});
