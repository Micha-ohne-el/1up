import '/deps/dotenv-load.ts';

import {readLines} from '/deps/io.ts';
import postgres from '/deps/postgres.ts';
import {getDbCredentials} from '/util/secrets.ts';
import {warning, info} from '/deps/log.ts';

warning('Are you sure? Please confirm by typing "Yes, drop all my tables, please." and then pressing Enter.');

for await (const line of readLines(Deno.stdin)) {
  if (line === 'Yes, drop all my tables, please.') {
    info('Okay.');
    break;
  }

  info('Aborting.');
  Deno.exit();
}

info('Connecting to database...');

const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
)

info('Success.');

info('Dropping table "xp"...');

await sql`
  DROP TABLE IF EXISTS xp
`;

info('Success.');

info('Dropping table "range"...');

await sql`
  DROP TABLE IF EXISTS range
`;

info('Success.');

info('Dropping table "multiplier"...');

await sql`
  DROP TABLE IF EXISTS multiplier
`;

info('Success.');

info('Dropping table "role"...');

await sql`
  DROP TABLE IF EXISTS role
`;

info('Success.');

Deno.exit();
