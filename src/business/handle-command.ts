import {MessageContext} from '/business/message-context.ts';
import {commands, ParamError, Response, Command} from '/business/commands.ts';

import '/business/commands/set-multiplier.ts';
import '/business/commands/set-range.ts';
import '/business/commands/set-role.ts';
import '/business/commands/level.ts';
import '/business/commands/logs.ts';
import '/business/commands/status.ts';

export async function handleCommand(text: string, context: MessageContext): Promise<Response | void> {
  for (const command of commands) {
    const pos = text.toLowerCase().indexOf(command.$name.toLowerCase());

    if (pos === -1) {
      continue;
    }

    try {
      return await command.call(text.slice(pos), context);
    } catch (error: unknown) {
      if (!(error instanceof ParamError)) {
        throw error;
      }

      return {
        success: false,
        message: constructErrorMessage(error, command)
      };
    }
  }
}

function constructErrorMessage(error: ParamError, command: Command): string {
  const parts = [command.$name, ...command.$params.values()];
  const underlines = parts.map(part => (part === error.param ? '~' : ' ').repeat(part.toString().length));

  return error.message + '\n```\n' + parts.join(' ') + '\n' + underlines.join(' ') + '\n```';
}
