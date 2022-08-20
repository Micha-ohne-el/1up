import postgres from '/deps/postgres.ts';
import {getDbCredentials} from '/util/secrets.ts';

export async function awardXp(guildId: bigint, userId: bigint, amount: number) {
  return await sql`
    INSERT INTO stats (
      guildId, userId, xp
    )
    VALUES (
      ${guildId.toString()}, ${userId.toString()}, ${amount}
    )
    ON CONFLICT (guildId, userId)
    DO UPDATE
      SET xp = stats.xp + ${amount}
      WHERE stats.guildId = ${guildId.toString()}
        AND stats.userId = ${userId.toString()}
    RETURNING *
  `;
}

export async function awardXpAndMessages(guildId: bigint, userId: bigint, xp: number, messages: number) {
  return await sql`
    INSERT INTO stats (
      guildId, userId, xp, messages
    )
    VALUES (
      ${guildId.toString()}, ${userId.toString()}, ${xp}, ${messages}
    )
    ON CONFLICT (guildId, userId)
    DO UPDATE
      SET xp = stats.xp + ${xp}, messages = stats.messages + ${messages}
      WHERE stats.guildId = ${guildId.toString()}
        AND stats.userId = ${userId.toString()}
    RETURNING *
  `;
}

export async function getXp(userId: bigint, guildId: bigint) {
  return await sql`
    SELECT xp
    FROM stats
    WHERE userId = ${userId.toString()}
      AND guildId = ${guildId.toString()}
  `;
}

export async function getGlobalXp(userId: bigint) {
  return await sql`
    SELECT xp
    FROM stats
    WHERE userId = ${userId.toString()}
  `;
}

export async function getRoles(guildId: bigint) {
  return await sql`
    SELECT level, roleId
    FROM role
    WHERE guildId = ${guildId.toString()}
  `;
}

export async function getRoleForLevel(guildId: bigint, level: number) {
  return await sql`
    SELECT roleId
    FROM role
    WHERE guildId = ${guildId.toString()}
      AND level <= ${level}
    ORDER BY level DESC
    LIMIT 1
  `;
}

export async function setRoleForLevel(guildId: bigint, level: number, roleId: bigint) {
  return await sql`
    INSERT INTO role (
      guildId, level, roleId
    )
    VALUES (
      ${guildId.toString()}, ${level}, ${roleId.toString()}
    )
    ON CONFLICT (guildId, level)
    DO UPDATE
      SET roleId = ${roleId.toString()}
      WHERE role.guildId = ${guildId.toString()}
        AND role.level = ${level}
    RETURNING *
  `;
}

export async function getLeaderboard(guildId: bigint, amount: number) {
  return await sql`
    SELECT userId, xp, messages
    FROM stats
    WHERE guildId = ${guildId.toString()}
    ORDER BY xp
    LIMIT ${amount}
  `;
}

export const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
);
