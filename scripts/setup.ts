import {sql} from '/db.ts';

console.log('Creating table "xp"...');

await sql`
  CREATE TABLE xp (
    guildId bigint,
    userId bigint,
    xp real NOT NULL,
    PRIMARY KEY(guildId, userId)
  )
`;

console.log('Success.');

Deno.exit();
