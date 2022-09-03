import {bigintOrUndefined} from '../util/bigint-or-undefined.ts';
import {sql} from '/data/db.ts';

export async function setModeratorRole(guildId: bigint, roleId: bigint) {
  await sql`
    INSERT INTO config (
      guildId, moderatorRole
    )
    VALUES (
      ${guildId.toString()}, ${roleId.toString()}
    )
    ON CONFLICT (guildId)
    DO UPDATE
      SET moderatorRole = ${roleId.toString()}
      WHERE config.guildId = ${guildId.toString()}
  `;
}

export async function getModeratorRole(guildId: bigint) {
  const rows = await sql`
    SELECT moderatorRole
    FROM config
    WHERE guildId = ${guildId.toString()}
  `;

  if (rows.length === 0) {
    return undefined;
  }

  return bigintOrUndefined(rows[0]['moderatorrole']);
}

export async function clearModeratorRole(guildId: bigint) {
  await sql`
    DELETE FROM config
    WHERE guildId = ${guildId.toString()}
  `;
}
