import {MessageContext} from '/business/message-context.ts';
import {commands, ParamError, Response, Command, PermissionError} from '/business/commands.ts';
import {warning} from '/util/log.ts';

import '/business/commands/multiplier.ts';
import '/business/commands/range.ts';
import '/business/commands/role.ts';
import '/business/commands/level.ts';
import '/business/commands/logs.ts';
import '/business/commands/status.ts';
import '/business/commands/update.ts';
import '/business/commands/leaderboard.ts';

export async function handleCommand(text: string, context: MessageContext): Promise<Response | void> {
  const possibleCommands = getPossibleCommands(commands, text);

  const errors: {command: Command, error: Error}[] = [];

  for (const [command, text] of possibleCommands) {
    try {
      return await command.call(text, context);
    } catch (err: unknown) {
      warning(err);

      if (!(err instanceof Error)) {
        continue;
      }

      errors.push({error: err, command});
    }
  }

  return {
    success: false,
    message: 'Could not execute command.\n\n'
      + errors.map(({error, command}) => constructErrorMessage(error, command)).filter(msg => msg).join('\n')
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

function constructErrorMessage(error: PermissionError, command: Command): string | undefined;
function constructErrorMessage(error: ParamError, command: Command): string | undefined;
function constructErrorMessage(error: Error, command: Command): string | undefined {
  if (error instanceof ParamError) {
    const parts = [command.$name, ...command.$params.values()];
    const underlines = parts.map(part => (part === error.param ? '~' : ' ').repeat(part.toString().length));

    return error.message + '\n```\n' + parts.join(' ') + '\n' + underlines.join(' ') + '\n```';
  } else if (error instanceof PermissionError) {
    return error.message + ' Specifically: `' + command.$name + '`';
  }
}
