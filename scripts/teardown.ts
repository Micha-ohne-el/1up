import {readLines} from '/deps/io.ts';
import postgres from '/deps/postgres.ts';
import {getDbCredentials} from '/util/secrets.ts';

console.warn('Are you sure? Please confirm by typing "Yes, drop all my tables, please." and then pressing Enter.');

for await (const line of readLines(Deno.stdin)) {
  if (line === 'Yes, drop all my tables, please.') {
    console.log('Okay.');
    break;
  }

  console.log('Aborting.');
  Deno.exit();
}

console.group('Connecting to database...');

const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
)

console.log('Success.');
console.groupEnd();

console.group('Dropping table "xp"...');

await sql`
  DROP TABLE IF EXISTS xp
`;

console.log('Success.');
console.groupEnd();

Deno.exit();
