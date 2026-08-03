-- ============================================================
--  Fase 1 · Datos de ejemplo (seed) de tesorería
-- ============================================================
--  Se ejecuta después de 01_schema.sql.
--  Usuario demo:  demo@tesoreria.com  /  demo1234
--  (el hash es bcrypt de "demo1234")
-- ============================================================

-- ------------------------------------------------------------
--  Usuario (id = 1)
-- ------------------------------------------------------------
INSERT INTO users (email, password_hash, name) VALUES
('demo@tesoreria.com', '$2b$10$LxNgGUtvRG6EGC/iVxRO/uhHOM1R5WtpEkZTdG/cY3dbv4VWt0JMC', 'Raúl Andrade');

-- ------------------------------------------------------------
--  Cuentas (ids 1..4) — todas del usuario 1
-- ------------------------------------------------------------
INSERT INTO accounts (user_id, name, currency, balance) VALUES
(1, 'Cuenta Corriente BROU',        'UYU', 1850430.75),
(1, 'Caja de Ahorro USD Santander', 'USD',  128940.20),
(1, 'Cuenta Operativa EUR',         'EUR',   45200.00),
(1, 'Cuenta Recaudadora USD',       'USD',   73580.50);

-- ------------------------------------------------------------
--  Movimientos
--  type: 'credito' = entra plata, 'debito' = sale plata
-- ------------------------------------------------------------

-- Cuenta 1: Cuenta Corriente BROU (UYU)
INSERT INTO transactions (account_id, type, amount, description, occurred_at) VALUES
(1, 'credito', 620000.00, 'Cobro factura A-10432 Cliente Distribuidora del Sur', '2026-07-28 10:15:00-03'),
(1, 'debito',  185000.00, 'Pago nómina quincena julio',                         '2026-07-31 09:00:00-03'),
(1, 'debito',   42350.00, 'Pago proveedor Insumos Rivera S.A.',                 '2026-07-25 14:20:00-03'),
(1, 'debito',   12800.00, 'Impuesto DGI - anticipo IVA',                        '2026-07-22 11:05:00-03'),
(1, 'credito', 310500.00, 'Cobro factura A-10440 Cliente Logística Norte',      '2026-08-01 16:45:00-03'),
(1, 'debito',    1450.00, 'Comisión mantenimiento cuenta',                      '2026-08-01 00:05:00-03');

-- Cuenta 2: Caja de Ahorro USD Santander
INSERT INTO transactions (account_id, type, amount, description, occurred_at) VALUES
(2, 'credito', 25000.00, 'Transferencia recibida export USD - Cliente Miami LLC', '2026-07-29 13:30:00-03'),
(2, 'debito',   8500.00, 'Pago proveedor exterior Shenzhen Trading',              '2026-07-30 08:10:00-03'),
(2, 'debito',   3200.00, 'Pago licencia software anual (SaaS)',                   '2026-07-26 17:00:00-03'),
(2, 'credito', 41000.00, 'Cobro factory USD - Contrato servicios Q3',            '2026-08-02 12:00:00-03'),
(2, 'debito',     45.00, 'Comisión transferencia SWIFT',                          '2026-07-30 08:11:00-03');

-- Cuenta 3: Cuenta Operativa EUR
INSERT INTO transactions (account_id, type, amount, description, occurred_at) VALUES
(3, 'credito', 18000.00, 'Cobro cliente España - Factura EU-2201',    '2026-07-24 09:40:00-02'),
(3, 'debito',   6200.00, 'Pago proveedor UE - Herramientas Berlín',   '2026-07-27 15:25:00-02'),
(3, 'debito',    980.00, 'Suscripción infraestructura cloud EUR',     '2026-08-01 06:00:00-02');

-- Cuenta 4: Cuenta Recaudadora USD (procesamiento de pagos)
INSERT INTO transactions (account_id, type, amount, description, occurred_at) VALUES
(4, 'credito', 15230.00, 'Liquidación pasarela de pagos - lote 8801', '2026-07-28 20:00:00-03'),
(4, 'credito', 22110.50, 'Liquidación pasarela de pagos - lote 8815', '2026-07-30 20:00:00-03'),
(4, 'debito',   1830.20, 'Retención comisión procesador (2.9%)',      '2026-07-30 20:01:00-03'),
(4, 'credito', 19940.00, 'Liquidación pasarela de pagos - lote 8829', '2026-08-02 20:00:00-03'),
(4, 'debito',  12000.00, 'Barrido a cuenta operativa (transferencia)','2026-08-03 08:30:00-03');
