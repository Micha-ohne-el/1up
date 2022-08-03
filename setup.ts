import {sql} from '/db.ts';

await sql
  `
    CREATE TABLE xp (
      guildId bigint,
      userId bigint,
      xp real
    )
  `;

Deno.exit();
