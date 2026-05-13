import type { Message } from 'discord.js';
import { todayStr, mention, formatMsk } from '../utils.js';
import { getDayRolls, anarchyTwentyBlocksRole } from '../db/index.js';
import { getTiebreakState } from '../tiebreak.js';
import { getDisplayName } from '../roles.js';

export async function handleTop(message: Message): Promise<void> {
  const date  = todayStr();
  const rows  = await getDayRolls(date);
  const guild = message.guild;

  if (!rows.length) {
    await message.reply('Сегодня ещё никто не кидал `!arbuz`.');
    return;
  }

  const finalized = rows.filter((r) => r.finalized);
  const pending   = rows.filter((r) => !r.finalized);
  const normal    = finalized.filter((r) => r.mode === 'normal');
  const anarchy   = finalized.filter((r) => r.mode === 'anarchy');

  const lines: string[] = [`🏆 **Лидерборд за ${date} (МСК)**`];

  if (pending.length) {
    const names = pending.map((r) => getDisplayName(guild, r.userId)).join(', ');
    lines.push(`⏳ Ждут решения \`!да/!нет\`: ${names}`);
  }

  lines.push('');
  lines.push('🍉 **Топ на роль АРБУЗ (только обычные броски 1–20):**');
  if (normal.length) {
    [...normal]
      .sort((a, b) => b.value - a.value)
      .forEach((r, i) => {
        lines.push(`${i + 1}. ${getDisplayName(guild, r.userId)} — **${r.value}**`);
      });
  } else {
    lines.push('— сегодня никто не сделал обычный финальный бросок');
  }

  lines.push('');
  lines.push('🎲 **Арбузная анархия (отдельно от розыгрыша роли):**');
  if (anarchy.length) {
    [...anarchy]
      .sort((a, b) => b.value - a.value)
      .forEach((r, i) => {
        lines.push(`${i + 1}. ${getDisplayName(guild, r.userId)} — **${r.value}**`);
      });
  } else {
    lines.push('— сегодня никто не включал анархию');
  }

  // Распределение обычных бросков
  const dist: Record<number, number> = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [i + 1, 0]),
  );
  normal.forEach((r) => { if (r.value >= 1 && r.value <= 20) dist[r.value]!++; });

  lines.push('');
  lines.push('🔢 **Распределение обычных бросков (1–20):**');
  if (Object.values(dist).some((v) => v > 0)) {
    lines.push(Object.entries(dist).map(([k, v]) => `${k}:${v}`).join(' '));
  } else {
    lines.push('— нет данных');
  }

  if (await anarchyTwentyBlocksRole(date)) {
    lines.push('');
    lines.push('🚫 **В анархии выпало 20 — роль АРБУЗ сегодня не получает никто.**');
  }

  const st = await getTiebreakState(null);
  if (st) {
    const names       = st.users.map((u) => getDisplayName(guild, u)).join(', ');
    const deadlineStr = st.deadlineIso ? formatMsk(new Date(st.deadlineIso)) : '—';
    lines.push('');
    lines.push(
      `⚔️ **Активный тай-брейк** за ${st.date} (раунд ${st.round}): ${names}. Дедлайн: **${deadlineStr}**`,
    );
  }

  await message.reply(lines.join('\n'));
}
