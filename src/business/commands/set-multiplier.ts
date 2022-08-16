import {command, param, Command, Channel, Float, Role} from '/business/commands.ts';
import {MessageContext} from '/business/message-context.ts';
import {setXpMultiplier} from '/data/multipliers.ts';

@command('setMultiplier')
class _SetMultiplier extends Command {
  @param(Channel, Role)
  id!: bigint;

  @param(Float)
  multiplier!: number;

  override async invoke({canEdit}: MessageContext) {
    if (!canEdit(this.id)) {
      return {success: false};
    }

    await setXpMultiplier(this.id, this.multiplier);

    return {
      success: true
    };
  }
}
