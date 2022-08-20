import {MessageContext} from '/business/message-context.ts';
import {command, Command, param, optional, Guild, Response, BadParamError} from '/business/commands.ts';
import {getLeaderboardOfGuild} from '/data/xp.ts';
import {mentionUser} from '/business/mention.ts';

@command('leaderboard')
class _Leaderboard extends Command {
  @param(Guild, 'this')
  @optional()
  guildId!: bigint | 'this' | undefined;

  override async invoke({guildId}: MessageContext): Promise<Response> {
    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    const leaderboard = await getLeaderboardOfGuild(guild, 25);

    if (leaderboard.length === 0) {
      return {
        success: false,
        message: 'There does not seem to be a leaderboard for that server. How odd 🤔'
      }
    }

    return {
      message: leaderboard.map((entry, index) => (
        `**#${index + 1}** – ${mentionUser(entry.userId)} – `
        + `${entry.xp} XP / level ${entry.level} (with ${entry.messages} messages)`
      )).join('\n')
    };
  }
}
