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

## Backend (API REST)

### Levantarlo

```bash
cd backend
cp .env.example .env      # la primera vez; editá los valores
npm install               # la primera vez
npm run dev               # arranca con recarga automática (node --watch)
```

Queda escuchando en `http://localhost:4000`.

### Endpoints

| Método | Ruta                      | Protegido | Qué hace                                  |
|--------|---------------------------|-----------|-------------------------------------------|
| GET    | `/api/health`             | No        | Chequeo de vida del servicio              |
| POST   | `/api/auth/register`      | No        | Crea usuario, devuelve `{ user, token }`  |
| POST   | `/api/auth/login`         | No        | Login, devuelve `{ user, token }`         |
| GET    | `/api/accounts`           | Sí (JWT)  | Lista las cuentas del usuario             |
| GET    | `/api/transactions`       | Sí (JWT)  | Lista movimientos (`?account_id=`, `?limit=`) |
| POST   | `/api/chat`               | Sí (JWT)  | Pregunta en lenguaje natural → respuesta de IA |

Las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

### El chatbot (`/api/chat`) — patrón RAG

Recibe `{ "message": "...", "history": [...] }` y devuelve `{ "answer": "..." }`. El flujo:

1. **Retrieval** — consulta en Postgres las cuentas, los totales por moneda
   (`SUM` en SQL), los últimos movimientos y las **tasas de cambio** del usuario.
2. **Augment** — arma ese contexto en texto y lo inyecta en el prompt (system).
3. **Generation** — llama a `gpt-4o-mini` con un *system prompt* que le prohíbe
   inventar datos (`temperature: 0.2` para respuestas factuales).

**Memoria conversacional.** El frontend reenvía los mensajes previos (`history`)
en cada pedido; el backend acota a los últimos 10 turnos. Así el asistente
"recuerda" la charla (los LLM no tienen memoria propia entre pedidos).

**Conversión de monedas.** El asistente convierte usando **solo** la tabla
`exchange_rates` (fuente auditable), nunca tasas inventadas o dadas por chat.

**Proveedor de IA (configurable).** El backend usa variables propias `LLM_*`
en `backend/.env`, así ninguna variable global del shell (`OPENAI_API_KEY`,
`OPENAI_BASE_URL`) interfiere. Como la API es compatible con OpenAI, cambiás de
proveedor con solo editar el `.env`:

```bash
# OpenRouter (agregador multi-modelo)
LLM_API_KEY=sk-or-v1-...
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-4o-mini

# OpenAI directo
# LLM_BASE_URL=https://api.openai.com/v1
# LLM_MODEL=gpt-4o-mini
```

### Ejemplo rápido (curl)

```bash
# Login → guarda el token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@tesoreria.com","password":"demo1234"}' \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

# Usar el token
curl http://localhost:4000/api/accounts -H "Authorization: Bearer $TOKEN"
```

## Frontend (React + Vite)

### Levantarlo

```bash
cd frontend
cp .env.example .env      # la primera vez
npm install               # la primera vez
npm run dev               # arranca en http://localhost:5199
```

Necesita el **backend corriendo** (puerto 4000) y la **base** levantada.
Login demo: `demo@tesoreria.com` / `demo1234`.

### Qué incluye

- **Login** — formulario que guarda el JWT en `localStorage`.
- **Vista de cuentas** — tarjetas con saldos por moneda (`GET /api/accounts`).
- **Chat** — interfaz de conversación con el asistente (`POST /api/chat`).

Todos los pedidos al backend pasan por `src/api.js`, que adjunta el JWT en el
header `Authorization` automáticamente. La URL del backend sale de `VITE_API_URL`.

## Estado del proyecto (por fases)

- [x] **Fase 1** — Estructura, Docker + PostgreSQL, schema y seed.
- [x] **Fase 2** — Backend Express con API REST y autenticación JWT.
- [x] **Fase 3** — Integración del chatbot con OpenAI en `/chat`.
- [x] **Fase 4** — Frontend React (login + interfaz de chat).
- [ ] **Fase 5** — CI con GitHub Actions.
