import {command, availableTo, param, Command, Channel, Float, Role, GuildOwner, Moderator} from '/business/commands.ts';
import {getXpMultiplier, setXpMultiplier} from '/data/multipliers.ts';

@command('multiplier', 'mult')
@availableTo(GuildOwner)
class _SetMultiplier extends Command {
  @param(Channel, Role)
  id!: bigint;

  @param(Float)
  multiplier!: number;

  // TODO: IMPORTANT!
  // Currently, this enables any guild owner (anyone) to change any multiplier globally.
  // The proper solution to this is having command params resolve to the correct Discord entities intead of just their IDs,
  // and then checking which guild the channel/role belongs to.
  override async invoke() {
    await setXpMultiplier(this.id, this.multiplier);

    return {
      success: true
    };
  }
}

@command('multiplier', 'mult')
@availableTo(Moderator)
class _GetMultiplier extends Command {
  @param(Channel, Role)
  id!: bigint;

  override async invoke() {
    return {
      message: `×${await getXpMultiplier(this.id)}`
    };
  }
}
