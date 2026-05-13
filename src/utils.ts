/**
 * MSK = UTC+3, без перехода на летнее время.
 * nowMsk() возвращает Date, у которого getUTC* методы дают значения по МСК.
 */
export function nowMsk(): Date {
  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}

export function todayStr(mskDate?: Date): string {
  const d   = mskDate ?? nowMsk();
  const y   = d.getUTCFullYear();
  const m   = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Дедлайн тай-брейка за dateStr: следующий день в 12:00 МСК = 09:00 UTC.
 */
export function tiebreakDeadlineFor(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + 1, 9, 0, 0));
}

/** Форматирует UTC Date как строку вида "DD.MM HH:MM МСК" */
export function formatMsk(utcDate: Date): string {
  const msk = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);
  const d   = String(msk.getUTCDate()).padStart(2, '0');
  const mo  = String(msk.getUTCMonth() + 1).padStart(2, '0');
  const h   = String(msk.getUTCHours()).padStart(2, '0');
  const min = String(msk.getUTCMinutes()).padStart(2, '0');
  return `${d}.${mo} ${h}:${min} МСК`;
}

export function mention(userId: string): string {
  return `<@${userId}>`;
}

export function roll(): number {
  return Math.floor(Math.random() * 20) + 1;
}
