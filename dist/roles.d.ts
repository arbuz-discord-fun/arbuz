import type { Client, Guild } from 'discord.js';
export declare function setClient(client: Client): void;
/** Снимает АРБУЗ со всех и выдаёт победителю. Возвращает true если успешно. */
export declare function setWinnerRole(winnerId: string): Promise<boolean>;
/**
 * Снимает АРБУЗ со всех и выдаёт роль ТЫКВЕНЕЦ всем не-ботам.
 * Возвращает true если роль ТЫКВЕНЕЦ найдена и выдана.
 */
export declare function setTykvenetsToAll(): Promise<boolean>;
/** Возвращает отображаемое имя участника или "user:ID" если не найден. */
export declare function getDisplayName(guild: Guild | null, userId: string): string;
