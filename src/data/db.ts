import postgres from '/deps/postgres.ts';
import {getDbCredentials} from '/util/secrets.ts';

export async function getAll() {
  return await sql`
    SELECT *
    FROM xp
  `;
}

export async function awardXp(guildId: bigint, userId: bigint, amount: number) {
  return await sql`
    INSERT INTO xp (
      guildId, userId, xp
    )
    VALUES (
      ${guildId.toString()}, ${userId.toString()}, ${amount}
    )
    ON CONFLICT (guildId, userId)
    DO UPDATE
      SET xp = xp.xp + ${amount}
      WHERE xp.guildId = ${guildId.toString()}
        AND xp.userId = ${userId.toString()}
    RETURNING *
  `;
}

export async function getXp(userId: bigint, guildId: bigint) {
  return await sql`
    SELECT xp
    FROM xp
    WHERE userId = ${userId.toString()}
      AND guildId = ${guildId.toString()}
  `;
}

export async function getGlobalXp(userId: bigint) {
  return await sql`
    SELECT xp
    FROM xp
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

export const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
);
