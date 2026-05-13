import { and, count, desc, eq } from 'drizzle-orm';
import { db } from './client.js';
import { meta, rolls, serverRoles, tiebreaks, type Roll, type RoleType } from './schema.js';

// ─── meta ────────────────────────────────────────────────────────────────────

export async function metaGet(key: string): Promise<string | null> {
  const [row] = await db.select().from(meta).where(eq(meta.key, key));
  return row?.value ?? null;
}

export async function metaSet(key: string, value: string | null): Promise<void> {
  if (value === null) {
    await db.delete(meta).where(eq(meta.key, key));
  } else {
    await db
      .insert(meta)
      .values({ key, value })
      .onConflictDoUpdate({ target: meta.key, set: { value } });
  }
}

// ─── server_roles ────────────────────────────────────────────────────────────

/** Возвращает ID Discord-роли по типу ('arbuz' | 'tykvenets'), или null если не задана */
export async function getServerRoleId(roleType: RoleType): Promise<string | null> {
  const [row] = await db
    .select()
    .from(serverRoles)
    .where(eq(serverRoles.roleType, roleType));
  return row?.roleId ?? null;
}

/** Сохраняет или обновляет ID Discord-роли */
export async function setServerRoleId(roleType: RoleType, roleId: string): Promise<void> {
  await db
    .insert(serverRoles)
    .values({ roleType, roleId })
    .onConflictDoUpdate({ target: serverRoles.roleType, set: { roleId } });
}

/** Возвращает все настроенные роли */
export async function getAllServerRoles(): Promise<Record<RoleType, string | null>> {
  const rows = await db.select().from(serverRoles);
  const map: Record<string, string | null> = { arbuz: null, tykvenets: null };
  for (const row of rows) map[row.roleType] = row.roleId;
  return map as Record<RoleType, string | null>;
}

// ─── rolls ───────────────────────────────────────────────────────────────────

export async function getUserRoll(date: string, userId: string): Promise<Roll | null> {
  const [row] = await db
    .select()
    .from(rolls)
    .where(and(eq(rolls.date, date), eq(rolls.userId, userId)));
  return row ?? null;
}

export async function insertRoll(
  date: string,
  userId: string,
  value: number,
  mode: 'normal' | 'anarchy',
  finalized: boolean,
): Promise<void> {
  await db.insert(rolls).values({ date, userId, value, mode, finalized });
}

export async function updateRoll(
  date: string,
  userId: string,
  value: number,
  mode: 'normal' | 'anarchy',
  finalized: boolean,
): Promise<void> {
  await db
    .update(rolls)
    .set({ value, mode, finalized })
    .where(and(eq(rolls.date, date), eq(rolls.userId, userId)));
}

/** Финализирует все незакрытые единицы (пользователь не ответил !да/!нет) */
export async function finalizePendingAsOnes(date: string): Promise<void> {
  await db
    .update(rolls)
    .set({ finalized: true, mode: 'normal', value: 1 })
    .where(and(eq(rolls.date, date), eq(rolls.finalized, false)));
}

export async function getDayRolls(date: string): Promise<Roll[]> {
  return db.select().from(rolls).where(eq(rolls.date, date));
}

/** Возвращает true, если в анархии за этот день кто-то выбил 20 */
export async function anarchyTwentyBlocksRole(date: string): Promise<boolean> {
  const [result] = await db
    .select({ total: count() })
    .from(rolls)
    .where(
      and(
        eq(rolls.date, date),
        eq(rolls.finalized, true),
        eq(rolls.mode, 'anarchy'),
        eq(rolls.value, 20),
      ),
    );
  return (result?.total ?? 0) > 0;
}

/** Возвращает всех участников с максимальным обычным броском за день */
export async function topCandidates(
  date: string,
): Promise<Pick<Roll, 'userId' | 'value'>[]> {
  const rows = await db
    .select({ userId: rolls.userId, value: rolls.value })
    .from(rolls)
    .where(
      and(eq(rolls.date, date), eq(rolls.finalized, true), eq(rolls.mode, 'normal')),
    )
    .orderBy(desc(rolls.value));

  if (!rows.length) return [];
  const maxVal = rows[0]!.value;
  return rows.filter((r) => r.value === maxVal);
}

// ─── tiebreaks ───────────────────────────────────────────────────────────────

export async function tiebreakUserAlreadyRolled(
  date: string,
  round: number,
  userId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: tiebreaks.userId })
    .from(tiebreaks)
    .where(
      and(eq(tiebreaks.date, date), eq(tiebreaks.round, round), eq(tiebreaks.userId, userId)),
    );
  return row !== undefined;
}

export async function tiebreakRecord(
  date: string,
  round: number,
  userId: string,
  value: number,
): Promise<void> {
  await db.insert(tiebreaks).values({ date, round, userId, value });
}

export async function tiebreakRoundResults(
  date: string,
  round: number,
): Promise<Pick<typeof tiebreaks.$inferSelect, 'userId' | 'value'>[]> {
  return db
    .select({ userId: tiebreaks.userId, value: tiebreaks.value })
    .from(tiebreaks)
    .where(and(eq(tiebreaks.date, date), eq(tiebreaks.round, round)));
}
