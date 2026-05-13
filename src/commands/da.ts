import type { Message } from 'discord.js';
import { roll, todayStr } from '../utils.js';
import { getUserRoll, updateRoll } from '../db/index.js';
import { ANARCHY_TIMEOUT_SEC } from '../config.js';

export async function handleDa(message: Message): Promise<void> {
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
    await message.reply('`!да` работает только если ты выбросил 1.');
    return;
  }

  const elapsed = (Date.now() - new Date(row.createdAt).getTime()) / 1000;
  if (elapsed > ANARCHY_TIMEOUT_SEC) {
    await updateRoll(date, userId, 1, 'normal', true);
    await message.reply('⏰ Время вышло. Остаётся **1**.');
    return;
  }

  const value = roll();
  await updateRoll(date, userId, value, 'anarchy', true);

  if (value === 20) {
    await message.reply(
      `включил арбузную анархию и выбросил **20** 🍉\n` +
      `🚫 По правилам роль **АРБУЗ** за сегодня не получает никто.`,
    );
  } else {
    await message.reply(`включил арбузную анархию и выбросил **${value}** 🍉`);
  }
}
