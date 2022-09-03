import {MessageContext} from '/business/message-context.ts';
import {command, availableTo, param, Command, Int, GuildOwner, Moderator} from '/business/commands.ts';
import {getGuildXpRange, setXpRange} from '/data/multipliers.ts';

@command('range')
@availableTo(GuildOwner)
class _SetRange extends Command {
  @param(Int)
  first!: number;

  @param(Int)
  last!: number;

  override async invoke({guildId}: MessageContext) {
    if (guildId === undefined) {
      throw new Error('This command must be used in a guild.');
    }

    await setXpRange(guildId, this.first, this.last);

    return {success: true};
  }
}

@command('range')
@availableTo(Moderator)
class _GetRange extends Command {
  override async invoke({guildId}: MessageContext) {
    if (guildId === undefined) {
      throw new Error('This command must be used in a guild.');
    }

    const [first, last] = await getGuildXpRange(guildId);

    return {
      message: `XP will be randomly chosen between ${first} and ${last}.`
    };
  }
}
