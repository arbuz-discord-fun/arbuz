import { roll, todayStr } from '../utils.js';
import { getUserRoll, insertRoll, tiebreakUserAlreadyRolled, tiebreakRecord, } from '../db/index.js';
import { getTiebreakState } from '../tiebreak.js';
import { maybeFinishTiebreak } from '../dayEnd.js';
import { ANARCHY_TIMEOUT_SEC } from '../config.js';
export async function handleArbuz(message) {
    const userId = message.author.id;
    const today = todayStr();
    // Если пользователь участвует в активном тай-брейке — бросок идёт в тай-брейк
    const st = await getTiebreakState(null);
    if (st?.users.includes(userId)) {
        const { date, round } = st;
        if (await tiebreakUserAlreadyRolled(date, round, userId)) {
            await message.reply('⛔ Ты уже кинул в этом раунде тай-брейка.');
            return;
        }
        const value = roll();
        await tiebreakRecord(date, round, userId, value);
        await message.reply(`(тай-брейк за ${date}, раунд ${round}) выбросил **${value}** 🎲`);
        await maybeFinishTiebreak(date);
        return;
    }
    // Обычный дневной бросок
    const existing = await getUserRoll(today, userId);
    if (existing) {
        if (!existing.finalized && existing.value === 1) {
            await message.reply('ты уже выбил **1** и ждёшь решение: `!да` / `!нет`.');
        }
        else {
            await message.reply(`ты уже кидал сегодня. Твой результат: **${existing.value}**.`);
        }
        return;
    }
    const value = roll();
    if (value === 1) {
        await insertRoll(today, userId, 1, 'normal', false);
        await message.reply(`выбросил **1** 🎲\n` +
            `Хочешь арбузную анархию? \`!да\` / \`!нет\`\n` +
            `⏳ Ответь в течение ${ANARCHY_TIMEOUT_SEC} секунд.`);
        return;
    }
    await insertRoll(today, userId, value, 'normal', true);
    await message.reply(`выбросил **${value}** 🎲`);
}
