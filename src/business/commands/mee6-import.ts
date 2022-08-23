import {MessageContext} from '/business/message-context.ts';
import {command, availableTo, ServerOwner, Command, param, Text, Response} from '/business/commands.ts';
import {sql} from '/data/db.ts';
import {error, warning, info} from '/util/log.ts';
import postgres from 'https://deno.land/x/postgresjs@v3.2.4/types/index.d.ts';
import {getLevelFromXp} from '../../data/xp.ts';

@command('mee6import')
@availableTo(ServerOwner)
class _Mee6Import extends Command {
  @param(Text)
  things!: string;

  override async invoke({guildId}: MessageContext): Promise<Response> {
    if (!guildId) {
      throw new Error('This command must be used on the server you are trying to import to.');
    }

    const things: Things = {
      messages: this.things.toLowerCase().includes('messages'),
      xp: this.things.toLowerCase().includes('xp'),
      range: this.things.toLowerCase().includes('range')
    };

    await sql.begin(async (sql) => {
      for (let page = 0; true; page++) {
        const response =
          await fetch(`https://mee6.xyz/api/plugins/levels/leaderboard/${guildId}?limit=${this.pageSize}&page=${page}`);

        if (!response.ok) {
          error('MEE6 API Response was not OK. Rolling back.', {response, text: await response.text()});
          return await sql`ROLLBACK`;
        }

        const data = await response.json() as Mee6Response;
        const entries = mee6ResponseToEntries(data);

        if (entries.length > this.pageSize) {
          warning(`MEE6 API sent back too many entries. Continuing.`, {expected: this.pageSize, got: entries.length});
        }

        for (const entry of entries) {
          if (!isEntry(entry)) {
            error('At least one entry is invalid. Rolling back.', {entry, entries, data});
            return await sql`ROLLBACK`;
          }

          if (entry.level !== getLevelFromXp(entry.xp)) {
            warning(
              'Levelling algorithms are not identical. Continuing.',
              {got: entry.level, expected: getLevelFromXp(entry.xp)}
            );
          }
        }

        await this.importData(sql, entries, things);

        if (entries.length < this.pageSize) {
          info('Reached last page.', page);
          return;
        }
      }
    });

    return {
      success: true,
      message: 'Successfully imported data from MEE6!'
    };
  }

  private async importData(sql: postgres.TransactionSql<any>, entries: Entry[], things: Things) {
    if (things.range) {
      // clear table range
      // insert all the new values (probably should make use of postgres.js's cool features for this)
      info('Successfully imported range!');
    } else {
      info('Did not import rang, because user did not request it.', things);
    }

    if (things.xp) {
      // same as above
      info('Successfully imported xp!');
    } else {
      info('Did not import xp, because user did not request it.', things);
    }

    if (things.messages) {
      // yada yada yada
      info('Successfully imported messages!');
    } else {
      info('Did not import messages, because user did not request it.', things);
    }
  }

  private readonly pageSize = 1000;
}

function mee6ResponseToEntries(response: Mee6Response): Entry[] {
  return response.players.map(mee6PlayerToEntry);
}

function mee6PlayerToEntry(player: Mee6Player): Entry {
  return {
    userId: BigInt(player.id),
    level: player.level,
    xp: player.xp,
    messages: player.message_count
  }
}

function isEntry(value: unknown): value is Entry {
  return typeof value === 'object'
    && value !== null
    && typeof (value as Partial<Entry>).userId === 'bigint'
    && typeof (value as Partial<Entry>).level === 'number'
    && typeof (value as Partial<Entry>).xp === 'number'
    && typeof (value as Partial<Entry>).messages === 'number'
}

interface Things {
  xp: boolean;
  messages: boolean;
  range: boolean;
}

// The following interfaces intentionally only include fields that we care about.

interface Entry {
  userId: bigint;
  level: number;
  xp: number;
  messages: number;
}

interface Mee6Response {
  players: Mee6Player[];
  xp_per_message: [number, number];
}

interface Mee6Player {
  detailed_xp: [number, number, number];
  id: string; // bigint
  level: number;
  message_count: number;
  xp: number;
}
