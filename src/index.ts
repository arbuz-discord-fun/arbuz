import { runMigrations } from './db/migrate.js';
import { startBot } from './bot.js';

async function main(): Promise<void> {
  console.log('[db] Применяем миграции...');
  await runMigrations();

  console.log('[bot] Запускаем бота...');
  await startBot();
}

main().catch((err: unknown) => {
  console.error('Фатальная ошибка:', err);
  process.exit(1);
});
