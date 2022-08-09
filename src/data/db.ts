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

export async function getXpWhere(conditions: Partial<Row> | string) {
  const condition = Object.entries(conditions).map(([key, value]) => `${key} = ${value}`).join(' AND ');

  const rows = await sql`
    SELECT xp
    FROM xp
    WHERE ${condition}
  `;

  return rows.reduce((acc: number[], row) => [...acc, row['xp']], []);
}

export const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
);

interface Row {
  guildId: bigint;
  userId: bigint;
  xp: number;
}
