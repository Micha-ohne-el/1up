import {getOwnerId} from '/util/secrets.ts';
import {MessageContext} from '/business/message-context.ts';
import {codeBlock} from '/business/wrap.ts';
import {command, Command} from '/business/commands.ts';
import {logMemory} from '/util/log.ts';

@command('status')
class _Status extends Command {
  override async invoke({authorId}: MessageContext) {
    if (authorId !== getOwnerId()) {
      return {success: false, message: 'You do not have permissions to view the logs.'};
    }

    const loadAverages = Deno.loadavg().map(num => `${num * 100}%`).join('/');
    const memoryInfo = Deno.systemMemoryInfo();
    const memoryStatus = `${Math.floor(memoryInfo.available / 1024)} MB / ${Math.floor(memoryInfo.total / 1024)} MB available`;

    return {
      message: `**CPU Load averages (past 5/10/15 minutes):** ${loadAverages}\n`
        + `**Memory status:** ${memoryStatus}\n`
        + '**Recent logs:**\n'
        + codeBlock`${logMemory.get(20).join('\n')}`
    }
  }
}
