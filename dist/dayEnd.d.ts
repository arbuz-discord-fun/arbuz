import type { TextChannel } from 'discord.js';
export declare function setChannelGetter(fn: () => TextChannel | null): void;
/**
 * Завершает день: финализирует броски, определяет победителя или запускает тай-брейк.
 * Вызывается планировщиком в 23:59 МСК.
 */
export declare function processDayEnd(date: string): Promise<void>;
/**
 * Проверяет, закончился ли текущий раунд тай-брейка.
 * Вызывается после каждого броска участника тай-брейка.
 */
export declare function maybeFinishTiebreak(date: string): Promise<void>;
