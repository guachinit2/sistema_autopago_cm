/**
 * Configuración de la aplicación
 * Adaptado del backend-plan: usa Express + pg (según database-plan)
 */
export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsOrigin: process.env.CORS_ORIGIN || true,
} as const;
