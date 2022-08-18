import {MessageContext} from '/business/message-context.ts';
import {commands, ParamError, Response, Command} from '/business/commands.ts';
import {error} from '/util/log.ts';

import '/business/commands/multiplier.ts';
import '/business/commands/range.ts';
import '/business/commands/role.ts';
import '/business/commands/level.ts';
import '/business/commands/logs.ts';
import '/business/commands/status.ts';
import '/business/commands/update.ts';

export async function handleCommand(text: string, context: MessageContext): Promise<Response | void> {
  const possibleCommands = getPossibleCommands(commands, text);

  const errors: {command: Command, error: ParamError}[] = [];

  for (const [command, text] of possibleCommands) {
    try {
      return await command.call(text, context);
    } catch (err: unknown) {
      if (!(err instanceof ParamError)) {
        error('An error occurred while trying to call a command.', command, err);
        continue;
      }

      errors.push({command, error: err});
    }
  }

  return {
    success: false,
    message: 'Your query did not match any known command.\n\n'
      + errors.map(({error, command}) => constructErrorMessage(error, command)).join('\n')
  }
}

function getPossibleCommands(commands: Set<Command>, text: string): Map<Command, string> {
  const possibleCommands = new Map<Command, string>();

  for (const command of commands) {
    const pos = text.toLowerCase().indexOf(command.$name.toLowerCase());

    if (pos === -1) {
      continue;
    }

    possibleCommands.set(command, text.slice(pos));
  }

  return possibleCommands;
}

function constructErrorMessage(error: ParamError, command: Command): string {
  const parts = [command.$name, ...command.$params.values()];
  const underlines = parts.map(part => (part === error.param ? '~' : ' ').repeat(part.toString().length));

  return error.message + '\n```\n' + parts.join(' ') + '\n' + underlines.join(' ') + '\n```';
}
