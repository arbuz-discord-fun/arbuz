import { tiebreaks, type Roll, type RoleType } from './schema.js';
export declare function metaGet(key: string): Promise<string | null>;
export declare function metaSet(key: string, value: string | null): Promise<void>;
/** Возвращает ID Discord-роли по типу ('arbuz' | 'tykvenets'), или null если не задана */
export declare function getServerRoleId(roleType: RoleType): Promise<string | null>;
/** Сохраняет или обновляет ID Discord-роли */
export declare function setServerRoleId(roleType: RoleType, roleId: string): Promise<void>;
/** Возвращает все настроенные роли */
export declare function getAllServerRoles(): Promise<Record<RoleType, string | null>>;
export declare function getUserRoll(date: string, userId: string): Promise<Roll | null>;
export declare function insertRoll(date: string, userId: string, value: number, mode: 'normal' | 'anarchy', finalized: boolean): Promise<void>;
export declare function updateRoll(date: string, userId: string, value: number, mode: 'normal' | 'anarchy', finalized: boolean): Promise<void>;
/** Финализирует все незакрытые единицы (пользователь не ответил !да/!нет) */
export declare function finalizePendingAsOnes(date: string): Promise<void>;
export declare function getDayRolls(date: string): Promise<Roll[]>;
/** Возвращает true, если в анархии за этот день кто-то выбил 20 */
export declare function anarchyTwentyBlocksRole(date: string): Promise<boolean>;
/** Возвращает всех участников с максимальным обычным броском за день */
export declare function topCandidates(date: string): Promise<Pick<Roll, 'userId' | 'value'>[]>;
export declare function tiebreakUserAlreadyRolled(date: string, round: number, userId: string): Promise<boolean>;
export declare function tiebreakRecord(date: string, round: number, userId: string, value: number): Promise<void>;
export declare function tiebreakRoundResults(date: string, round: number): Promise<Pick<typeof tiebreaks.$inferSelect, 'userId' | 'value'>[]>;
