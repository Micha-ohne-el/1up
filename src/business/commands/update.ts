import {MessageContext} from '/business/message-context.ts';
import {command, Command, Response} from '/business/commands.ts';
import {getOwnerId} from '/util/secrets.ts';
import {error} from '/util/log.ts';

@command('update')
class _Update extends Command {
  override async invoke({authorId}: MessageContext): Promise<Response> {
    if (authorId !== getOwnerId()) {
      return {success: false};
    }

    const fetchErrors = await Deno.run({
      cmd: ['git', 'fetch', '--all'],
      stderr: 'piped',
      clearEnv: true
    }).stderrOutput();

    if (fetchErrors.length > 0) {
      error(new TextDecoder().decode(fetchErrors));
    }

    const resetErrors = await Deno.run({
      cmd: ['git', 'reset', '--hard'],
      stderr: 'piped',
      clearEnv: true
    }).stderrOutput();

    if (resetErrors.length > 0) {
      error(new TextDecoder().decode(resetErrors));
    }

    if (fetchErrors.length > 0 || resetErrors.length > 0) {
      return {success: false};
    }

    await Deno.run({
      cmd: ['deno', 'task', 'run']
    });

    Deno.exit();
  }
}
