import {command, param, Command, Channel, Float, Role} from '/business/commands.ts';
import {MessageContext} from '/business/message-context.ts';
import {getXpMultiplier, setXpMultiplier} from '/data/multipliers.ts';

@command('multiplier', 'mult')
class _SetMultiplier extends Command {
  @param(Channel, Role)
  id!: bigint;

  @param(Float)
  multiplier!: number;

  override async invoke({checks}: MessageContext) {
    if (!checks.canEdit(this.id)) {
      return {success: false};
    }

    await setXpMultiplier(this.id, this.multiplier);

    return {
      success: true
    };
  }
}

@command('multiplier', 'mult')
class _GetMultiplier extends Command {
  @param(Channel, Role)
  id!: bigint;

  override async invoke() {
    return {
      message: `×${await getXpMultiplier(this.id)}`
    };
  }
}
