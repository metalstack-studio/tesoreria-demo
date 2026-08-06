// ============================================================
//  lib/summary.js · Resumen de saldos por moneda
// ============================================================
//  Función PURA (sin efectos secundarios), fácil de testear.
//  Agrupa un array de cuentas y suma los saldos por moneda.
//
//  Nota: para totales financieros "de verdad" la suma exacta la
//  hace la base con SUM() sobre NUMERIC; este helper es para
//  agregados de presentación en el lado del servidor.
// ============================================================

export function resumenPorMoneda(accounts) {
  if (!Array.isArray(accounts)) return {};

  const totales = {};
  for (const acc of accounts) {
    if (!acc || typeof acc.currency !== 'string') continue;
    const monto = Number(acc.balance) || 0;
    totales[acc.currency] = (totales[acc.currency] || 0) + monto;
  }
  return totales;
}
