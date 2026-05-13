import { anarchyTwentyBlocksRole, finalizePendingAsOnes, topCandidates, tiebreakRoundResults, } from './db/index.js';
import { getTiebreakState, startTiebreak, clearTiebreak } from './tiebreak.js';
import { setWinnerRole, setTykvenetsToAll } from './roles.js';
import { formatMsk, mention, tiebreakDeadlineFor } from './utils.js';
let _getChannel = null;
export function setChannelGetter(fn) {
    _getChannel = fn;
}
function ch() {
    return _getChannel?.() ?? null;
}
/**
 * Завершает день: финализирует броски, определяет победителя или запускает тай-брейк.
 * Вызывается планировщиком в 23:59 МСК.
 */
export async function processDayEnd(date) {
    const channel = ch();
    // 1. Финализируем незакрытые единицы (не ответили !да/!нет)
    await finalizePendingAsOnes(date);
    // 2. Если в анархии выпало 20 — никто не получает роль, все тыквенцы
    if (await anarchyTwentyBlocksRole(date)) {
        await setTykvenetsToAll();
        channel?.send(`🚫 Итоги за **${date}**: в арбузной анархии выпало **20**.\n` +
            `По правилам роль **АРБУЗ** за этот день не получает никто.\n` +
            `🎃 Тыквенцы захватили сервер!`);
        return;
    }
    // 3. Ищем кандидатов только среди обычных бросков
    const winners = await topCandidates(date);
    if (!winners.length) {
        await setTykvenetsToAll();
        channel?.send(`📭 Итоги за **${date}**: никто не сделал обычный бросок \`!arbuz\`.\n` +
            `🎃 Тыквенцы у власти!`);
        return;
    }
    const maxVal = winners[0].value;
    // 4. Один победитель — выдаём роль
    if (winners.length === 1) {
        const winnerId = winners[0].userId;
        const ok = await setWinnerRole(winnerId);
        channel?.send(`🍉 Итоги за **${date}**: победитель ${mention(winnerId)} со значением **${maxVal}**.\n` +
            (ok ? '✅ Роль **АРБУЗ** выдана.' : '⚠️ Не смог выдать роль (проверь права/позицию роли).'));
        return;
    }
    // 5. Ничья — запускаем тай-брейк (роль пока остаётся у прежнего владельца)
    const tiedIds = winners.map((w) => w.userId);
    await startTiebreak(date, tiedIds);
    const deadline = formatMsk(tiebreakDeadlineFor(date));
    channel?.send(`⚔️ Итоги за **${date}**: ничья на **${maxVal}** между ` +
        tiedIds.map(mention).join(' ') +
        `\nЗапускается тай-брейк. Дедлайн: **${deadline}**.\n` +
        `Текущая роль **АРБУЗ** пока остаётся у прошлого владельца.\n` +
        `Участники тай-брейка кидают \`!arbuz\` отдельно.`);
}
/**
 * Проверяет, закончился ли текущий раунд тай-брейка.
 * Вызывается после каждого броска участника тай-брейка.
 */
export async function maybeFinishTiebreak(date) {
    const st = await getTiebreakState(date);
    if (!st)
        return;
    const channel = ch();
    const { round, users } = st;
    const res = await tiebreakRoundResults(date, round);
    if (res.length < users.length)
        return; // ещё не все бросили
    const maxVal = Math.max(...res.map((r) => r.value));
    const roundWinners = res.filter((r) => r.value === maxVal);
    if (roundWinners.length === 1) {
        const winnerId = roundWinners[0].userId;
        channel?.send(`✅ Тай-брейк за **${date}**, раунд ${round} завершён.\n` +
            `Победитель: ${mention(winnerId)} (**${maxVal}**)`);
        // Анархия 20 блокирует роль даже в тай-брейке
        if (await anarchyTwentyBlocksRole(date)) {
            await clearTiebreak();
            await setTykvenetsToAll();
            channel?.send(`🚫 За **${date}** в анархии выпало **20** — роль **АРБУЗ** никому. 🎃 Тыквенцы!`);
        }
        else {
            const ok = await setWinnerRole(winnerId);
            await clearTiebreak();
            channel?.send(ok
                ? '🍉 Роль **АРБУЗ** выдана победителю тай-брейка.'
                : '⚠️ Не смог выдать роль (проверь права).');
        }
    }
    else {
        // Ничья в тай-брейке (Кейс 10) → ТЫКВЕНЕЦ всем
        const tiedIds = roundWinners.map((r) => r.userId);
        await clearTiebreak();
        await setTykvenetsToAll();
        channel?.send(`🤝 Ничья в тай-брейке за **${date}**, раунд ${round}!\n` +
            `Участники: ` + tiedIds.map(mention).join(' ') +
            `\n🎃 Никто не стал Арбузом. Тыквенцы захватили власть!`);
    }
}
