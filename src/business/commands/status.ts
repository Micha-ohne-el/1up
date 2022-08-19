import {codeBlock} from '/business/wrap.ts';
import {command, Command, availableTo, BotOwner} from '/business/commands.ts';
import {logMemory} from '/util/log.ts';

@command('status')
@availableTo(BotOwner)
class _Status extends Command {
  override async invoke() {
    const loadAverages = Deno.loadavg().map(num => `${num * 100}%`).join('/');
    const memoryInfo = Deno.systemMemoryInfo();
    const memoryStatus = `${Math.floor(memoryInfo.available / 1024)} MB / ${Math.floor(memoryInfo.total / 1024)} MB available`;

    return {
      message: `**CPU Load averages (past 5/10/15 minutes):** ${loadAverages}\n`
        + `**Memory status:** ${memoryStatus}\n`
        + '**Recent logs:**\n'
        + codeBlock`${logMemory.get(20, /CRITICAL|ERROR|WARNING/).join('\n')}`
    }
  }
}
