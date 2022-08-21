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
    const user = this.userId === 'me' || this.userId === undefined ? authorId : this.userId;
    const isRequestForAuthor = user === authorId;

    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    if (guild === 'global') {
      return await this.respondGlobalXp(user, isRequestForAuthor);
    }

    return await this.respondGuildXp(user, guild, isRequestForAuthor);
  }

  private async respondGlobalXp(user: bigint, isRequestForAuthor: boolean) {
    const xp = await getXpOfUserGlobally(user);

    if (isRequestForAuthor) {
      return {
        message: `Globally, you have collected ${xp} XP.`
      };
    }

    return {
      message: `Globally, this user has collected ${xp} XP.`
    };
  }

  private async respondGuildXp(user: bigint, guild: bigint, isRequestForAuthor: boolean) {
    const xp = await getXpOfUserInGuild(guild, user);

    if (isRequestForAuthor) {
      return {
        message: `You are at level ${getLevelFromXp(xp)}, with ${xp} XP.`
      };
    }

    return {
      message: `This user is at level ${getLevelFromXp(xp)}, with ${xp} XP.`
    };
  }
}
