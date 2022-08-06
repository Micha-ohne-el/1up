import {sql} from '/db.ts';

console.log('Dropping table "xp"...');

await sql`
  DROP TABLE xp
`;

console.log('Success.');

Deno.exit();
