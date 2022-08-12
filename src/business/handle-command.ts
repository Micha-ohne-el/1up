import {setXpMultiplier, setXpRange} from '/data/multipliers.ts';
import {MessageContext} from '/business/message-context.ts';
import {getLevelFromXp, getXpOfUserInGuild} from '/data/xp.ts';

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
      return {success: false, message: 'Please provide a valid channel or role to apply the multiplier to.'};
    }

    const multiplier = Number.parseFloat(tokens[2] ?? '');

    if (Number.isNaN(multiplier)) {
      return {success: false, message: 'Please provide a valid XP multiplier.'};
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
      return {success: false, message: 'Please provide a valid range of XP values.'};
    }

    await setXpRange(guildId, first, last);

    return {success: true};
  },
  async rank(text, {authorId, guildId}) {
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
  }
};
