import {MessageContext} from '/business/message-context.ts';
import {command, availableTo, ServerOwner, Command, param, Text, Response} from '/business/commands.ts';
import {sql} from '/data/db.ts';
import {error, warning, info} from '/util/log.ts';
import type postgres from '/deps/postgres.ts';
import {getLevelFromXp} from '/data/xp.ts';

@command('mee6import')
@availableTo(ServerOwner)
class _Mee6Import extends Command {
  @param(Text)
  things!: string;

  override async invoke({guildId}: MessageContext): Promise<Response> {
    const pageSize = 1000;

    if (!guildId) {
      throw new Error('This command must be used on the server you are trying to import to.');
    }

    const things: Things = {
      stats: this.things.toLowerCase().includes('stats'),
      range: this.things.toLowerCase().includes('range')
    };

    info('Starting import process...');
    const result = await sql.begin(async (sql) => {
      const data: Partial<Data> = {};

      for (let page = 0; true; page++) {
        info(`Fetching page #${page}`);

        const httpResponse =
          await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?limit=${pageSize}&page=${page}`);

        if (httpResponse.status === 404) {
          error('Could not find MEE6 leaderboard for this server.');
          await sql`ROLLBACK`;
          return false;
        }

        if (!httpResponse.ok) {
          error('MEE6 API Response was not OK. Rolling back.', {httpResponse, text: await httpResponse.text()});
          await sql`ROLLBACK`;
          return false;
        }

        const response = await httpResponse.json() as Mee6Response;
        const range = mee6ResponseToRange(response);
        const entries = mee6ResponseToEntries(response);

        if (entries.length > pageSize) {
          warning(`MEE6 API sent back more entries than expected. Continuing.`, {expected: this.pageSize, got: entries.length});
        }

        if (!isRange(range)) {
          error('Range is invalid. Rolling back.', {response});
          await sql`ROLLBACK`;
          return false;
        }

        for (const entry of entries) {
          if (!isEntry(entry)) {
            error('At least one entry is invalid. Rolling back.', {entry, entries, response});
            await sql`ROLLBACK`;
            return false;
          }

          if (entry.guildId !== guildId) {
            error('At least one entry is for the wrong guildId. Rolling back.', {entry, entries, response});
            await sql`ROLLBACK`;
            return false;
          }

          if (entry.level !== getLevelFromXp(entry.xp)) {
            warning(
              'Levelling algorithms are not identical. Continuing.',
              {got: entry.level, expected: getLevelFromXp(entry.xp)}
            );
          }
        }

        data.range = range;
        if (!data.entries) {
          data.entries = [];
        }
        data.entries.push(...entries);
        data.guildId = mee6ResponseToGuildId(response);

        if (entries.length < pageSize) {
          info('Reached last page.', page);
          break;
        }
      }

      await this.importData(sql, data as Data, things);

      return true;
    });


    if (result) {
      return {
        success: true,
        message: 'Successfully imported data from MEE6!'
      };
    } else {
      return {
        success: false,
        message: 'An error occurred, sorry.'
      }
    }
  }

  private async importData(sql: postgres.TransactionSql<any>, {guildId, range, entries}: Data, things: Things) {
    if (things.range && range) {
      await this.importRange(sql, guildId, range);

      info('Successfully imported range!');
    } else {
      info('Did not import range.', {range, things});
    }
    if (things.stats && entries) {
      await this.importStats(sql, guildId, entries);

      info('Successfully imported stats!');
    } else {
      info('Did not import stats.', {entries, things});
    }
  }

  private async importRange(sql: postgres.TransactionSql<any>, guildId: bigint, range: [number, number]) {
    info(`Deleting all rows in table "range" with guildId = ${guildId}`);
    await sql`
      DELETE FROM range
      WHERE guildId = ${guildId.toString()}
    `;
    info('Success.');

    info('Inserting into table "range".', {range});
    await sql`
      INSERT INTO range (
        guildId, first, last
      )
      VALUES (
        ${guildId.toString()}, ${range[0]}, ${range[1]}
      )
    `;
    info('Success.');
  }

  private async importStats(sql: postgres.TransactionSql<any>, guildId: bigint, entries: Entry[]) {
    info(`Deleting all rows in table "stats" with guildId = ${guildId}`);
    await sql`
      DELETE FROM stats
      WHERE guildId = ${guildId.toString()}
    `;
    info('Success.');

    info('Inserting into table "stats".', {entries});

    for (const {guildId, userId, xp, messages} of entries) {
      await sql`
        INSERT INTO stats (
          guildId, userId, xp, messages
        )
        VALUES (
          ${guildId.toString()}, ${userId.toString()}, ${xp}, ${messages}
        )
      `;
    }
    info('Success.');
  }
}

function mee6ResponseToRange(response: Mee6Response): [number, number] {
  return response.xp_per_message;
}

function mee6ResponseToEntries(response: Mee6Response): Entry[] {
  return response.players.map(mee6PlayerToEntry);
}

function mee6ResponseToGuildId(response: Mee6Response): bigint {
  return BigInt(response.guild.id);
}

function mee6PlayerToEntry(player: Mee6Player): Entry {
  return {
    userId: BigInt(player.id),
    guildId: BigInt(player.guild_id),
    level: player.level,
    xp: player.xp,
    messages: player.message_count
  }
}

function isRange(value: unknown): value is [number, number] {
  return typeof value === 'object'
    && value !== null
    && value instanceof Array
    && value.length === 2
    && typeof value[0] === 'number'
    && typeof value[1] === 'number';
}

function isEntry(value: unknown): value is Entry {
  return typeof value === 'object'
    && value !== null
    && typeof (value as Partial<Entry>).userId === 'bigint'
    && typeof (value as Partial<Entry>).level === 'number'
    && typeof (value as Partial<Entry>).xp === 'number'
    && typeof (value as Partial<Entry>).messages === 'number';
}

interface Things {
  stats: boolean;
  range: boolean;
}

interface Data {
  range?: [number, number];
  entries?: Entry[];
  guildId: bigint;
}

interface Entry {
  userId: bigint;
  guildId: bigint;
  level: number;
  xp: number;
  messages: number;
}

// The following interfaces intentionally only include fields that we care about.

interface Mee6Response {
  players: Mee6Player[];
  xp_per_message: [number, number];
  guild: {
    id: string; // bigint
  };
}

interface Mee6Player {
  detailed_xp: [number, number, number];
  id: string; // bigint
  guild_id: string; // bigint
  level: number;
  message_count: number;
  xp: number;
}
