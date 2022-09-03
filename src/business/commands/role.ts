import {command, availableTo, Command, param, require, Int, Role, BadParamError, GuildOwner} from '/business/commands.ts';
import {MessageContext} from '/business/message-context.ts';
import {setLevelRoleId, getLevelRoleId, getLevelRoleIds, clearLevelRoleId} from '/data/roles.ts';
import {mentionRole} from '/business/mention.ts';

@command('role')
@availableTo(GuildOwner)
class _SetRole extends Command {
  @param(Int)
  @require((level: number) => level > 0)
  level!: number;

  @param(Role)
  role!: bigint;

  override async invoke({guildId, checks}: MessageContext) {
    if (guildId === undefined) {
      throw new Error('This command must be used in a guild.');
    }

    if (!await checks.isRole(this.role, guildId)) {
      throw new BadParamError(this.$params.get('role')!, this.role, 'Value cannot be used for this parameter.');
    }

    await setLevelRoleId(guildId, this.level, this.role);

    return {success: true};
  }
}

@command('role')
class _ClearRole extends Command {
  @param(Int)
  @require((level: number) => level > 0)
  level!: number;

  @param('clear')
  role!: 'clear';

  override async invoke({guildId}: MessageContext) {
    if (guildId === undefined) {
      throw new Error('This command must be used in a guild.');
    }

    await clearLevelRoleId(guildId, this.level);

    return {success: true};
  }
}

@command('role')
class _GetRole extends Command {
  @param(Int)
  @require((level: number) => level > 0)
  level!: number;

  override async invoke({guildId}: MessageContext) {
    if (guildId === undefined) {
      throw new Error('This command must be used in a guild.');
    }

    const role = await getLevelRoleId(guildId, this.level);

    if (role) {
      return {message: `Users at level ${this.level} are assigned ${mentionRole(role)}`};
    } else {
      return {message: `Users at level ${this.level} do not have a role yet.`};
    }
  }
}

@command('roles')
class _GetRoles extends Command {
  override async invoke({guildId}: MessageContext) {
    if (guildId === undefined) {
      throw new Error('This command must be used in a guild.');
    }

    const roles = await getLevelRoleIds(guildId);

    if (roles.length) {
      return {
        message: 'These are the roles for that Guild:\n'
          + roles.map(({level, roleId}) => `Level ${level}: ${mentionRole(roleId)}`).join('\n')
      };
    } else {
      return {message: `Guild does not have any roles configured.`};
    }
  }
}
