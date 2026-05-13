/**
 * Применяет SQL-миграции из папки migrations/.
 * Использует CREATE TABLE IF NOT EXISTS, поэтому безопасно запускать повторно.
 */
export declare function runMigrations(): Promise<void>;
