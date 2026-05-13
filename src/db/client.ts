import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import { DATABASE_URL } from '../config.js';

const { Pool } = pg;

export const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle(pool, { schema });
