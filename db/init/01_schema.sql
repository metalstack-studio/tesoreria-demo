-- ============================================================
--  Fase 1 · Esquema de la base de datos (Asistente de Tesorería)
-- ============================================================
--  Este archivo lo ejecuta PostgreSQL automáticamente la PRIMERA
--  vez que el contenedor arranca (carpeta /docker-entrypoint-initdb.d).
--  Se corre en orden alfabético: 01_schema.sql antes que 02_seed.sql.
-- ============================================================

-- Limpieza defensiva (por si se re-ejecuta manualmente).
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ------------------------------------------------------------
--  users: quién se loguea a la app
-- ------------------------------------------------------------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    -- Guardamos el HASH de la contraseña (bcrypt), nunca el texto plano.
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(120) NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  accounts: cuentas de tesorería con saldo y moneda
-- ------------------------------------------------------------
CREATE TABLE accounts (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(120) NOT NULL,
    -- Código ISO-4217 de la moneda (USD, UYU, EUR...).
    currency   CHAR(3) NOT NULL,
    -- DINERO: SIEMPRE NUMERIC, nunca float/double (evita errores de redondeo).
    balance    NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- ------------------------------------------------------------
--  transactions: movimientos de cada cuenta
-- ------------------------------------------------------------
CREATE TABLE transactions (
    id          SERIAL PRIMARY KEY,
    account_id  INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    -- Tipo del movimiento, acotado con CHECK (como un ENUM simple).
    type        VARCHAR(10) NOT NULL CHECK (type IN ('credito', 'debito')),
    amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_occurred_at ON transactions(occurred_at);
