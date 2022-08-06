import postgres from '/deps/postgres.ts';
import {getDbCredentials} from '/util/secrets.ts';

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

console.group('Creating table "xp"...');

await sql`
  CREATE TABLE xp (
    guildId bigint,
    userId bigint,
    xp real NOT NULL,
    PRIMARY KEY(guildId, userId)
  )
`;

console.log('Success.');
console.groupEnd();

console.group('Creating table "range"...');

await sql`
  CREATE TABLE range (
    guildId bigint,
    first real NOT NULL,
    last real NOT NULL,
    PRIMARY KEY(guildId)
  )
`;

console.log('Success.');
console.groupEnd();

console.group('Creating table "multiplier"...');

await sql`
  CREATE TABLE multiplier (
    id bigint,
    multiplier real NOT NULL,
    PRIMARY KEY(id)
  )
`;

console.log('Success.');
console.groupEnd();

Deno.exit();
