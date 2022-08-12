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

export const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
);
