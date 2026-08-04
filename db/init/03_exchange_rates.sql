-- ============================================================
--  Fase 4.5 · Tabla de tasas de cambio (para conversión de monedas)
-- ============================================================
--  El asistente NO debe inventar tasas: las toma de esta tabla,
--  que es la "fuente de verdad" auditable. En una app real, estas
--  filas se actualizarían desde una API oficial o el banco central.
--
--  Cada fila significa: 1 unidad de base_currency = rate quote_currency
--  Ej: (USD, UYU, 40) -> 1 USD = 40 UYU
-- ============================================================

CREATE TABLE IF NOT EXISTS exchange_rates (
    base_currency  CHAR(3) NOT NULL,
    quote_currency CHAR(3) NOT NULL,
    rate           NUMERIC(18,6) NOT NULL CHECK (rate > 0),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (base_currency, quote_currency)
);

-- Cargamos los pares que nos interesan (valores de ejemplo, ~2026).
-- ON CONFLICT: si ya existen, actualizamos la tasa (idempotente).
INSERT INTO exchange_rates (base_currency, quote_currency, rate) VALUES
('USD', 'UYU', 40.000000),
('UYU', 'USD',  0.025000),
('EUR', 'USD',  1.080000),
('USD', 'EUR',  0.925926),
('EUR', 'UYU', 43.200000),
('UYU', 'EUR',  0.023148)
ON CONFLICT (base_currency, quote_currency)
DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();
