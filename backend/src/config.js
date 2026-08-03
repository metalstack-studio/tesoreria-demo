// ============================================================
//  config.js · Lee y valida las variables de entorno
// ============================================================
//  Node carga el archivo .env automáticamente gracias al flag
//  --env-file=.env que pusimos en los scripts del package.json.
//  Aquí solo las leemos desde process.env y las dejamos ordenadas.
// ============================================================

export const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  // --- Config del proveedor de IA (Fase 3) ---
  // Usamos nombres PROPIOS (LLM_*) a propósito, para que NINGUNA
  // variable global del shell (como OPENAI_API_KEY / OPENAI_BASE_URL,
  // que podés tener exportadas para otras herramientas) nos "secuestre"
  // la config. El proyecto es dueño de su propia configuración.
  llm: {
    apiKey: process.env.LLM_API_KEY,
    // baseURL define el PROVEEDOR. Al ser API compatible con OpenAI,
    // el mismo SDK sirve para OpenAI, OpenRouter, Groq, etc.
    baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
  },
};

// "Fail fast": si falta una variable esencial, cortamos el arranque
// con un mensaje claro en vez de explotar más tarde de forma confusa.
const requeridas = ['databaseUrl', 'jwtSecret'];
for (const clave of requeridas) {
  if (!config[clave]) {
    console.error(`❌ Falta una variable de entorno obligatoria: ${clave}`);
    console.error('   Revisá tu archivo backend/.env (copiá backend/.env.example).');
    process.exit(1);
  }
}
