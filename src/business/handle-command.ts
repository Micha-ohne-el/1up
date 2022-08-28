import {MessageContext} from '/business/message-context.ts';
import {commands, ParamError, BadParamError, Response, Command, PermissionError} from '/business/commands.ts';
import {warning} from '/util/log.ts';
import {codeBlock} from '/business/wrap.ts';

import '/business/commands/multiplier.ts';
import '/business/commands/range.ts';
import '/business/commands/role.ts';
import '/business/commands/level.ts';
import '/business/commands/logs.ts';
import '/business/commands/status.ts';
import '/business/commands/leaderboard.ts';
import '/business/commands/mee6-import.ts';
import '/business/commands/help.ts';

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
    for (const name of command.$names) {
      if (text.toLowerCase().startsWith(name.toLowerCase())) {
        possibleCommands.set(command, text.slice(name.toLowerCase().length).trim());
        break;
      }
    }
  }

  return possibleCommands;
}

function constructErrorMessage(error: PermissionError, command: Command): string | undefined;
function constructErrorMessage(error: ParamError, command: Command): string | undefined;
function constructErrorMessage(error: Error, command: Command): string | undefined {
  if (error instanceof BadParamError) {
    return error.message + '\n' + codeBlock(command.toErrorMessage(error.param));
  } else if (error instanceof ParamError) {
    return error.message + '\n' + codeBlock(command.toString());
  } else if (error instanceof PermissionError) {
    return error.message;
  }
}
