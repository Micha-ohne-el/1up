import {MessageContext} from '/business/message-context.ts';
import {command, Command, param, optional, User, Guild, BadParamError} from '/business/commands.ts';
import {getLevelFromXp, getXpOfUserGlobally, getXpOfUserInGuild} from '/data/xp.ts';

@command('level')
class _Level extends Command {
  @optional()
  @param(User, 'me')
  userId!: bigint | 'me' | undefined;

  @optional()
  @param(Guild, 'this', 'global')
  guildId!: bigint | 'this' | 'global' | undefined;

  override async invoke({authorId, guildId}: MessageContext) {
    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    if (this.userId === 'me' || this.userId === undefined) {
      if (guild === 'global') {
        const xp = await getXpOfUserGlobally(authorId);

        return {
          message: `Globally, you have collected ${xp} XP.`
        };
      }

      const xp = await getXpOfUserInGuild(guild, authorId);

      return {
        message: `You are at level ${getLevelFromXp(xp)}, with ${xp} XP.`
      };
    } else {
      if (guild === 'global') {
        const xp = await getXpOfUserGlobally(this.userId);

        return {
          message: `Globally, this user has collected ${xp} XP.`
        };
      }

      const xp = await getXpOfUserInGuild(guild, this.userId);

      return {
        message: `This user is at level ${getLevelFromXp(xp)}, with ${xp} XP.`
      };
    }
  }
}
