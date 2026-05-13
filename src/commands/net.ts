import type { Message } from 'discord.js';
import { todayStr } from '../utils.js';
import { getUserRoll, updateRoll } from '../db/index.js';

export async function handleNet(message: Message): Promise<void> {
  const userId = message.author.id;
  const date   = todayStr();

  const row = await getUserRoll(date, userId);
  if (!row) {
    await message.reply('Сначала кинь `!arbuz`.');
    return;
  }
  if (row.finalized) {
    await message.reply('Твой бросок уже финализирован. Сегодня второй попытки нет.');
    return;
  }
  if (row.value !== 1) {
    await message.reply('`!нет` работает только если ты выбросил 1.');
    return;
  }

  await updateRoll(date, userId, 1, 'normal', true);
  await message.reply('отказался от анархии. Остаётся **1** 🍉');
}
