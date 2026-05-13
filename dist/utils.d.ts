/**
 * MSK = UTC+3, без перехода на летнее время.
 * nowMsk() возвращает Date, у которого getUTC* методы дают значения по МСК.
 */
export declare function nowMsk(): Date;
export declare function todayStr(mskDate?: Date): string;
/**
 * Дедлайн тай-брейка за dateStr: следующий день в 12:00 МСК = 09:00 UTC.
 */
export declare function tiebreakDeadlineFor(dateStr: string): Date;
/** Форматирует UTC Date как строку вида "DD.MM HH:MM МСК" */
export declare function formatMsk(utcDate: Date): string;
export declare function mention(userId: string): string;
export declare function roll(): number;
