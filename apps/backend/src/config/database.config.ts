/**
 * Configuración de base de datos PostgreSQL
 * Adaptado del backend-plan: usa pg nativo (según database-plan, init-db.sql)
 */
export const databaseConfig = {
  connectionString:
    process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/autopago',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
} as const;
