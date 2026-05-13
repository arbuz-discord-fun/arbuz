import type { Client, Guild, Role } from 'discord.js';
import { GUILD_ID } from './config.js';
import { getServerRoleId } from './db/index.js';

let _client: Client | null = null;

export function setClient(client: Client): void {
  _client = client;
}

function getGuild(): Guild | null {
  return _client?.guilds.cache.get(GUILD_ID) ?? null;
}

async function getRole(roleType: 'arbuz' | 'tykvenets'): Promise<Role | null> {
  const guild  = getGuild();
  if (!guild) return null;
  const roleId = await getServerRoleId(roleType);
  if (!roleId) return null;
  return guild.roles.cache.get(roleId) ?? null;
}

async function removeRoleFromAll(role: Role): Promise<void> {
  for (const [, member] of role.members) {
    try {
      await member.roles.remove(role, 'Arbuz daily reset');
    } catch { /* игнорируем ошибки прав */ }
  }
}

/** Снимает АРБУЗ со всех и выдаёт победителю. Возвращает true если успешно. */
export async function setWinnerRole(winnerId: string): Promise<boolean> {
  const guild = getGuild();
  if (!guild) return false;

  const role = await getRole('arbuz');
  if (!role) {
    console.warn('[roles] Роль АРБУЗ не настроена. Используй !setrole arbuz @Роль');
    return false;
  }

  await removeRoleFromAll(role);

  let member = guild.members.cache.get(winnerId);
  if (!member) {
    try {
      member = await guild.members.fetch(winnerId);
    } catch {
      return false;
    }
  }

  try {
    await member.roles.add(role, 'Arbuz daily winner');
    return true;
  } catch {
    return false;
  }
}

/**
 * Снимает АРБУЗ со всех и выдаёт роль ТЫКВЕНЕЦ всем не-ботам.
 * Возвращает true если роль ТЫКВЕНЕЦ найдена и выдана.
 */
export async function setTykvenetsToAll(): Promise<boolean> {
  const guild = getGuild();
  if (!guild) return false;

  const arbuzRole = await getRole('arbuz');
  const tykRole   = await getRole('tykvenets');

  if (!tykRole) {
    console.warn('[roles] Роль ТЫКВЕНЕЦ не настроена. Используй !setrole tykvenets @Роль');
    return false;
  }

  if (arbuzRole) await removeRoleFromAll(arbuzRole);

  let members;
  try {
    members = await guild.members.fetch();
  } catch {
    return false;
  }

  for (const [, member] of members) {
    if (member.user.bot) continue;
    try {
      await member.roles.add(tykRole, 'Arbuz tykvenets');
    } catch { /* игнорируем */ }
  }

  return true;
}

/** Возвращает отображаемое имя участника или "user:ID" если не найден. */
export function getDisplayName(guild: Guild | null, userId: string): string {
  const member = guild?.members.cache.get(userId);
  return member?.displayName ?? `user:${userId}`;
}
