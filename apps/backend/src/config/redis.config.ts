/**
 * Configuración de Redis (caché y sesiones - fase posterior)
 * Referencia: backend-plan 1.2
 */
export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
} as const;
