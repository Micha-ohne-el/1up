import {sql} from '/db.ts';

await sql`
  CREATE TABLE xp (
    guildId bigint,
    userId bigint,
    xp real NOT NULL,
    PRIMARY KEY(guildId, userId)
  )
`;

Deno.exit();
