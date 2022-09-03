import {clearModeratorRole, getModeratorRole, setModeratorRole} from '/data/config.ts';
import {mentionRole} from '/business/mention.ts';
import {command, availableTo, GuildOwner, Moderator, Command, param, Role, Response} from '/business/commands.ts';
import {MessageContext} from '/business/message-context.ts';

@command('moderator', 'mod')
@availableTo(GuildOwner)
class _SetModeratorRole extends Command {
  @param(Role, 'clear')
  roleId!: bigint | 'clear';

  override async invoke({guildId}: MessageContext): Promise<Response> {
    if (!guildId) {
      return {
        success: false,
        message: 'This command can only be used on a guild.'
      };
    }

    if (this.roleId === 'clear') {
      await clearModeratorRole(guildId);
    } else {
      await setModeratorRole(guildId, this.roleId);
    }

    return {success: true};
  }
}

@command('moderator', 'mod')
@availableTo(Moderator)
class _GetModeratorRole extends Command {
  override async invoke({guildId}: MessageContext): Promise<Response> {
    if (!guildId) {
      return {
        success: false,
        message: 'This command can only be used on a guild.'
      };
    }

    const roleId = await getModeratorRole(guildId);

    if (!roleId) {
      return {
        message: 'There is currently no moderator role set for this guild.'
      };
    }

    return {
      message: `The current moderator role is ${mentionRole(roleId)}`
    };
  }
}
