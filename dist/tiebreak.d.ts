export interface TiebreakState {
    date: string;
    round: number;
    users: string[];
    deadlineIso: string | null;
}
/**
 * Возвращает активный тай-брейк или null.
 * filterDate: если задан — вернуть только если active_date совпадает.
 * Если дедлайн истёк — автоматически очищает состояние.
 */
export declare function getTiebreakState(filterDate?: string | null): Promise<TiebreakState | null>;
export declare function startTiebreak(date: string, userIds: string[]): Promise<void>;
export declare function clearTiebreak(): Promise<void>;
