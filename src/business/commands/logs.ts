import {command, availableTo, Command, param, optional, require, Int, RegularExpression, BotOwner} from '/business/commands.ts';
import {logMemory} from '/util/log.ts';

@command('logs')
@availableTo(BotOwner)
class _Logs extends Command {
  @optional()
  @require((amount: number) => amount > 0)
  @param(Int)
  amount!: number | undefined;

  @optional()
  @param(RegularExpression)
  pattern!: RegExp | undefined;

  override async invoke() {
    const amount = this.amount ?? 20;

    return {
      message: '```\n' + logMemory.get(amount, this.pattern).join('\n') + '\n```'
    }
  }
}
