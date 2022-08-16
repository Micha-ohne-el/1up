import {MessageContext} from '/business/message-context.ts';
import {command, param, Command, Guild, Int, ParamError} from '/business/commands.ts';
import {setXpRange} from '../../data/multipliers.ts';

@command('setRange')
class _SetRange extends Command {
  @param(Guild, 'this')
  guildId!: bigint | 'this';

  @param(Int)
  first!: number;

  @param(Int)
  last!: number;

  override async invoke({canEdit, guildId}: MessageContext) {
    const guild = this.guildId === 'this' ? guildId : this.guildId;

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

    await setXpRange(guild, this.first, this.last);

    return {success: true};
  }
}
