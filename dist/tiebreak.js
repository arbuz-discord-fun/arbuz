import { metaGet, metaSet } from './db/index.js';
import { tiebreakDeadlineFor } from './utils.js';
/**
 * Возвращает активный тай-брейк или null.
 * filterDate: если задан — вернуть только если active_date совпадает.
 * Если дедлайн истёк — автоматически очищает состояние.
 */
export async function getTiebreakState(filterDate = null) {
    const activeDate = await metaGet('tiebreak_active_date');
    if (!activeDate)
        return null;
    if (filterDate !== null && activeDate !== filterDate)
        return null;
    const round = parseInt((await metaGet('tiebreak_round')) ?? '0', 10);
    const users = JSON.parse((await metaGet('tiebreak_users')) ?? '[]');
    const deadlineIso = await metaGet('tiebreak_deadline');
    if (deadlineIso && Date.now() > new Date(deadlineIso).getTime()) {
        await clearTiebreak();
        return null;
    }
    return { date: activeDate, round, users, deadlineIso };
}
export async function startTiebreak(date, userIds) {
    await metaSet('tiebreak_active_date', date);
    await metaSet('tiebreak_round', '1');
    await metaSet('tiebreak_users', JSON.stringify(userIds));
    await metaSet('tiebreak_deadline', tiebreakDeadlineFor(date).toISOString());
}
export async function clearTiebreak() {
    await metaSet('tiebreak_active_date', null);
    await metaSet('tiebreak_round', null);
    await metaSet('tiebreak_users', null);
    await metaSet('tiebreak_deadline', null);
}
