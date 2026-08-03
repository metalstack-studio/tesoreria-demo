# Asistente de Tesorería (Full Stack Demo)

Aplicación de demostración para practicar el stack **Node.js + React + PostgreSQL + IA generativa**.

Es un **chatbot con IA** que responde preguntas en lenguaje natural sobre cuentas y
movimientos financieros guardados en una base de datos real (ej: *"¿cuál es el saldo total
en dólares?"*, *"mostrame los últimos 5 movimientos"*). El backend consulta los datos reales
en PostgreSQL, se los pasa como contexto a OpenAI (`gpt-4o-mini`) y devuelve la respuesta.

## Stack

| Capa            | Tecnología                          |
|-----------------|-------------------------------------|
| Backend         | Node.js v24 + Express (API REST)    |
| Frontend        | React + Vite (JavaScript)           |
| Base de datos   | PostgreSQL 16 (vía Docker)          |
| Autenticación   | JWT (login usuario/contraseña)      |
| IA              | OpenAI `gpt-4o-mini`                |

## Requisitos

- **Docker Desktop** corriendo.
- **Node.js v24** (se recomienda con [nvm](https://github.com/nvm-sh/nvm): `nvm install 24`).
- Una **API key de OpenAI** (solo a partir de la Fase 3).

## Estructura del proyecto

```
fullstack.demo/
├─ backend/            # API REST Express (Fase 2+)
├─ frontend/           # App React + Vite (Fase 4)
├─ db/
│  └─ init/            # SQL que Postgres ejecuta al crear la base
│     ├─ 01_schema.sql # tablas: users, accounts, transactions
│     └─ 02_seed.sql   # datos de ejemplo de tesorería
├─ docker-compose.yml  # levanta PostgreSQL
├─ .env.example        # plantilla de variables (copiar a .env)
└─ README.md
```

## Puesta en marcha (desde cero)

### 1. Configurar variables de entorno

```bash
cp .env.example .env
# Editá .env y poné tus valores (password de la base, JWT_SECRET, etc.)
```

### 2. Levantar la base de datos

```bash
docker compose up -d
```

Esto crea la base `tesoreria` y ejecuta automáticamente el schema + el seed la
**primera** vez. Postgres queda escuchando en `localhost:5433`.

### 3. Verificar que hay datos

```bash
# Usuario demo cargado por el seed:  demo@tesoreria.com  /  demo1234
docker compose exec db psql -U tesoreria -d tesoreria -c "SELECT id, name, currency, balance FROM accounts;"
```

## Comandos útiles de Docker

```bash
docker compose up -d        # levantar en segundo plano
docker compose ps           # ver estado
docker compose logs -f db   # ver logs de la base
docker compose down         # apagar (conserva los datos)
docker compose down -v      # apagar y BORRAR los datos (re-ejecuta el seed al volver a levantar)
```

## Estado del proyecto (por fases)

- [x] **Fase 1** — Estructura, Docker + PostgreSQL, schema y seed.
- [ ] **Fase 2** — Backend Express con API REST y autenticación JWT.
- [ ] **Fase 3** — Integración del chatbot con OpenAI en `/chat`.
- [ ] **Fase 4** — Frontend React (login + interfaz de chat).
- [ ] **Fase 5** — CI con GitHub Actions.
