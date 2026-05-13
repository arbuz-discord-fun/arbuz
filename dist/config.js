import 'dotenv/config';
function required(name) {
    const val = process.env[name];
    if (!val)
        throw new Error(`Missing required env var: ${name}`);
    return val;
}
export const TOKEN = required('TOKEN');
export const GUILD_ID = required('GUILD_ID');
export const CHANNEL_ID = required('CHANNEL_ID');
export const DATABASE_URL = required('DATABASE_URL');
export const ANARCHY_TIMEOUT_SEC = 3600; // 1 час
// Тестовый режим: сбрасывать день каждые N минут (null = выключено)
export const TEST_RESET_EVERY_MINUTES = process.env['TEST_RESET_EVERY_MINUTES']
    ? parseInt(process.env['TEST_RESET_EVERY_MINUTES'], 10)
    : null;
