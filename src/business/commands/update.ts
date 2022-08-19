import {command, Command, Response, availableTo, BotOwner} from '/business/commands.ts';
import {error} from '/util/log.ts';

@command('update')
@availableTo(BotOwner)
class _Update extends Command {
  override async invoke(): Promise<Response> {
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

    Deno.exit();
  }
}
