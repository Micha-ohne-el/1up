import {setXpMultiplier, setXpRange} from '/data/multipliers.ts';
import {MessageContext} from '/business/message-context.ts';
import {getLevelFromXp, getXpOfUserInGuild} from '/data/xp.ts';
import {setLevelRoleId} from '/data/roles.ts';
import {getOwnerId} from '/util/secrets.ts';
import {logMemory} from '/util/log-memory.ts';

export async function handleCommand(text: string, context: MessageContext): Promise<Response | void> {
  for (const [name, command] of Object.entries(commands)) {
    const pos = text.toLowerCase().indexOf(name.toLowerCase());

    if (pos === -1) {
      continue;
    }

    return await command(text.slice(pos), context);
  }
}

export interface Response {
  success?: boolean;
  message?: string;
}

const commands: Record<string, (text: string, context: MessageContext) => Promise<Response>> = {
  async setMultiplier(text, {canEdit}) {
    const tokens = text.split(/\s+/, 3) as (string | undefined)[];

    const match = tokens[1]?.match(/<[@#](\d+)>|(\d+)/);

    if (!match) {
      return {
        success: false, message: `Syntax:
\`\`\`
setMultiplier {id: Id | Snowflake} {multiplier: Number}
              ~~~~~~~~~~~~~~~~~~~~
\`\`\`
`
      };
    }

    const multiplier = Number.parseFloat(tokens[2] ?? '');

    if (Number.isNaN(multiplier)) {
      return {
        success: false, message: `Syntax:
\`\`\`
setMultiplier {id: Id | Snowflake} {multiplier: Number}
                                   ~~~~~~~~~~~~~~~~~~~~
\`\`\`
`
      };
    }

    const id = BigInt(match[1] ?? match[2])

    if (!canEdit(id)) {
      return {success: false};
    }

    await setXpMultiplier(id, multiplier);

    return {success: true};
  },
  async setRange(text, {guildId, canEdit}) {
    if (!guildId) {
      return {success: false, message: 'You cannot set XP ranges in DMs as of now.'};
    }

    if (!canEdit(guildId)) {
      return {success: false};
    }

    const tokens = text.split(/\s+/, 3) as (string | undefined)[];

    const first = Number.parseFloat(tokens[1] ?? '');
    const last = Number.parseFloat(tokens[2] ?? '');

    if (Number.isNaN(first) || Number.isNaN(last)) {
      return {
        success: false, message: `Syntax:
\`\`\`
setRange {start: Number} {end: Number}
         ~~~~~~~~~~~~~~~ ~~~~~~~~~~~~~
\`\`\`
`
      };
    }

    await setXpRange(guildId, first, last);

    return {success: true};
  },
  async setRole(text, {guildId, canEdit, isRole}) {
    if (!guildId) {
      return {success: false, message: 'You cannot set roles in DMs as of now.'};
    }

    if (!canEdit(guildId)) {
      return {success: false};
    }

    const tokens = text.split(/\s+/, 3) as (string | undefined)[];

    const level = Number.parseInt(tokens[1] ?? '', 10);

    if (Number.isNaN(level) || level < 0) {
      return {
        success: false, message: `Syntax:
\`\`\`
setRole {level: Integer} {role: Id | Snowflake}
        ~~~~~~~~~~~~~~~~
\`\`\`
`
      };
    }


    const match = tokens[2]?.match(/<[@](\d+)>|(\d+)/);

    if (!match) {
      return {
        success: false, message: `Syntax:
\`\`\`
setRole {level: Integer} {role: Id | Snowflake}
                         ~~~~~~~~~~~~~~~~~~~~~~
\`\`\`
`
      };
    }

    const roleId = BigInt(match[1] ?? match[2]);

    if (!await isRole(roleId)) {
      return {
        success: false, message: `Syntax:
\`\`\`
setRole {level: Integer} {role: Id | Snowflake}
                         ~~~~~~~~~~~~~~~~~~~~~~
\`\`\`
`
      };
    }

    await setLevelRoleId(guildId, level, roleId);

    return {success: true};
  },
  async level(text, {authorId, guildId}) {
    if (!guildId) {
      return {success: false, message: "You cannot get a user's rank in DMs as of now."};
    }

    const tokens = text.split(/\s+/, 2) as (string | undefined)[];

    const match = tokens[1]?.match(/<[@](\d+)>|(\d+)/);

    const userId = match ? BigInt(match[1]) : authorId;

    const xp = await getXpOfUserInGuild(guildId, userId);

    if (match) {
      return {
        message: `This user is at level ${getLevelFromXp(xp)}, with ${xp} XP.`
      };
    } else {
      return {
        message: `You are at level ${getLevelFromXp(xp)}, with ${xp} XP.`
      }
    }
  },
  async logs(text, {authorId}) {
    if (authorId !== getOwnerId()) {
      return {sucess: false, message: 'You do not have permission to view the logs.'};
    }

    const tokens = text.split(/\s+/, 2) as (string | undefined)[];

    const amount = Number.parseInt(tokens[1] ?? '20', 10);

    if (Number.isNaN(amount) || amount <= 0) {
      return {
        success: false, message: `Syntax:
\`\`\`
logs [amount: Integer = 20]
     ~~~~~~~~~~~~~~~~~~~~~~
\`\`\`
`
      };
    }

    return {
      message: '```\n' + logMemory.get(amount).join('\n') + '\n```'
    }
  }
};
