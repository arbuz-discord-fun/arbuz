import { readFile } from 'fs/promises';
import { join } from 'path';
import { pool } from './client.js';
/**
 * Применяет SQL-миграции из папки migrations/.
 * Использует CREATE TABLE IF NOT EXISTS, поэтому безопасно запускать повторно.
 */
export async function runMigrations() {
    const sqlPath = join(process.cwd(), 'migrations', '001_init.sql');
    const sql = await readFile(sqlPath, 'utf-8');
    await pool.query(sql);
    console.log('[db] Миграции применены');
}
