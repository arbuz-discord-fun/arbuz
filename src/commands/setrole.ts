import { PermissionFlagsBits, type Message } from 'discord.js';
import { setServerRoleId, getAllServerRoles } from '../db/index.js';
import type { RoleType } from '../db/schema.js';

const ROLE_TYPES: RoleType[] = ['arbuz', 'tykvenets'];

const USAGE = '**Использование:**\n' +
  '`!setrole arbuz @Роль` — роль победителя дня\n' +
  '`!setrole tykvenets @Роль` — роль тыквенца\n' +
  '`!setrole` — показать текущие настройки';

export async function handleSetrole(message: Message): Promise<void> {
  // Только пользователи с правом ManageRoles
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await message.reply('⛔ Нужно право **Управление ролями**.');
    return;
  }

  const parts = message.content.trim().split(/\s+/);

  // !setrole без аргументов — показываем текущие настройки
  if (parts.length === 1) {
    const current = await getAllServerRoles();
    const guild   = message.guild!;

    const lines = ['⚙️ **Текущие роли бота:**'];
    for (const type of ROLE_TYPES) {
      const roleId = current[type];
      const label  = roleId
        ? (guild.roles.cache.get(roleId)?.toString() ?? `<удалена: ${roleId}>`)
        : '— не задана';
      lines.push(`• **${type}**: ${label}`);
    }
    lines.push('', USAGE);
    await message.reply(lines.join('\n'));
    return;
  }

  // !setrole <type> @Role
  const rawType = parts[1]?.toLowerCase() as RoleType | undefined;
  if (!rawType || !ROLE_TYPES.includes(rawType)) {
    await message.reply(`❌ Неизвестный тип роли **${parts[1]}**.\n${USAGE}`);
    return;
  }

  const mentioned = message.mentions.roles.first();
  if (!mentioned) {
    await message.reply(`❌ Упомяни роль через @.\n${USAGE}`);
    return;
  }

  await setServerRoleId(rawType, mentioned.id);
  await message.reply(`✅ Роль **${rawType}** → ${mentioned} сохранена.`);
}
