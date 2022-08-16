import {command, Command, param, optional, require, Int, Role, Guild, ParamError} from '/business/commands.ts';
import {MessageContext} from '/business/message-context.ts';
import {setLevelRoleId} from '/data/roles.ts';

@command('setRole')
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
      throw new ParamError(
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
