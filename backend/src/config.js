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
  openaiApiKey: process.env.OPENAI_API_KEY, // se usa en la Fase 3
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
