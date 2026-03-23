import { Pool } from 'pg';
import { databaseConfig } from './config';

export const pool = new Pool({
  connectionString: databaseConfig.connectionString,
  max: databaseConfig.max,
  idleTimeoutMillis: databaseConfig.idleTimeoutMillis,
  connectionTimeoutMillis: databaseConfig.connectionTimeoutMillis,
});
