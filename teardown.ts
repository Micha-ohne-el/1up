import {sql} from '/db.ts';

await sql
  `
    DROP TABLE xp
  `;

Deno.exit();
