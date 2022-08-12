import {sql} from '/data/db.ts';

const fallbackRange: [number, number] = [10, 15];
export async function getGuildXpRange(id: bigint): Promise<[number, number]> {
  const rows = await sql`
    SELECT first, last
    FROM range
    WHERE guildId = ${id.toString()}
  `;

  if (rows.count === 0) {
    return fallbackRange;
  }

  return [rows[0]['first'], rows[0]['last']];
}

export async function getChannelXpMultiplier(id: bigint): Promise<number> {
  return await getMultiplier(id);
}

export async function getRoleXpMultiplier(id: bigint): Promise<number> {
  return await getMultiplier(id);
}

export async function setXpMultiplier(id: bigint, value: number): Promise<void> {
  await sql`
    INSERT INTO multiplier
    VALUES (${id.toString()}, ${value})
    ON CONFLICT (id)
    DO UPDATE
      SET multiplier = ${value}
  `;
}

export async function setXpRange(guildId: bigint, first: number, last: number): Promise<void> {
  await sql`
    INSERT INTO range
    VALUES (${guildId.toString()}, ${first}, ${last})
    ON CONFLICT (guildId)
    DO UPDATE
      SET first = ${first}, last = ${last}
  `;
}

const fallbackMultiplier = 1;
async function getMultiplier(id: bigint): Promise<number> {
  const rows = await sql`
    SELECT multiplier
    FROM multiplier
    WHERE id = ${id.toString()}
  `;

  if (rows.count === 0) {
    return fallbackMultiplier;
  }

  return rows[0]['multiplier'];
}
