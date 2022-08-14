import '/deps/dotenv-load.ts';

import postgres from '/deps/postgres.ts';
import {getDbCredentials} from '/util/secrets.ts';
import {info} from '/deps/log.ts';

info('Connecting to database...');

const sql = postgres(
  {
    host: 'localhost',
    database: 'oneup',
    ...getDbCredentials(),
  }
)

info('Success.');

info('Creating table "stats"...');

await sql`
  CREATE TABLE stats (
    guildId bigint,
    userId bigint,
    xp integer NOT NULL,
    messages integer NOT NULL,
    PRIMARY KEY(guildId, userId)
  )
`;

info('Success.');

info('Creating table "range"...');

await sql`
  CREATE TABLE range (
    guildId bigint,
    first real NOT NULL,
    last real NOT NULL,
    PRIMARY KEY(guildId)
  )
`;

info('Success.');

info('Creating table "multiplier"...');

await sql`
  CREATE TABLE multiplier (
    id bigint,
    multiplier real NOT NULL,
    PRIMARY KEY(id)
  )
`;

info('Success.');

info('Creating table "role"...');

await sql`
  CREATE TABLE role (
    guildId bigint,
    level integer,
    roleId bigint NOT NULL,
    PRIMARY KEY(guildId, level)
  )
`;

info('Success.');

Deno.exit();
