import {sql} from '/db.ts';
import {readLines} from '/deps/io.ts';

console.warn('Are you sure? Please confirm by typing "Yes, drop all my tables, please." and then pressing Enter.');

for await (const line of readLines(Deno.stdin)) {
  if (line === 'Yes, drop all my tables, please.') {
    console.log('Okay.');
    break;
  }

  console.log('Aborting.');
  Deno.exit();
}

console.log('Dropping table "xp"...');

await sql`
  DROP TABLE xp
`;

console.log('Success.');

Deno.exit();
