import {command, Command, param, optional, require, Int, Role, Guild, BadParamError} from '/business/commands.ts';
import {MessageContext} from '/business/message-context.ts';
import {setLevelRoleId, getLevelRoleId, getLevelRoleIds, clearLevelRoleId} from '/data/roles.ts';
import {mentionRole} from '/business/mention.ts';

@command('role')
class _SetRole extends Command {
  @param(Int)
  @require((level: number) => level > 0)
  level!: number;

  @param(Role)
  @require(async (id: bigint, {isRole}) => await isRole(id))
  role!: bigint;

  @optional()
  @param(Guild, 'this')
  guildId!: bigint | 'this' | undefined;

  override async invoke({guildId, canEdit}: MessageContext) {
    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    if (!canEdit(guild)) {
      return {success: false};
    }

    await setLevelRoleId(guild, this.level, this.role);

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

  @optional()
  @param(Guild, 'this')
  guildId!: bigint | 'this' | undefined;

  override async invoke({guildId, canEdit}: MessageContext) {
    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    if (!canEdit(guild)) {
      return {success: false};
    }

    await clearLevelRoleId(guild, this.level);

    return {success: true};
  }
}

@command('role')
class _GetRole extends Command {
  @param(Int)
  @require((level: number) => level > 0)
  level!: number;

  @optional()
  @param(Guild, 'this')
  guildId!: bigint | 'this' | undefined;

  override async invoke({guildId}: MessageContext) {
    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    const role = await getLevelRoleId(guild, this.level);

    if (role) {
      return {message: `Users at level ${this.level} are assigned ${mentionRole(role)}`};
    } else {
      return {message: `Users at level ${this.level} do not have a role yet.`};
    }
  }
}

@command('roles')
class _GetRoles extends Command {
  @optional()
  @param(Guild, 'this')
  guildId!: bigint | 'this' | undefined;

  override async invoke({guildId}: MessageContext) {
    const guild = this.guildId === 'this' || this.guildId === undefined ? guildId : this.guildId;

    if (guild === undefined) {
      throw new BadParamError(
        this.$params.get('guildId')!,
        this.guildId,
        'Please provide a Guild ID instead of using `this`, when using this command in DMs.'
      );
    }

    const roles = await getLevelRoleIds(guild);

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
