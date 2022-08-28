import {command, Command, param, optional, Text, commands as registeredCommands, Response} from '/business/commands.ts';
import {inlineCode} from '/business/wrap.ts';

@command('help')
class _Help extends Command {
  @param(Text)
  @optional()
  command!: string;

  override invoke(): Response {
    const commands = this.command ?
      [...registeredCommands.values()].filter(command => command.$names.includes(this.command)) : registeredCommands;

    return {
      message: 'Available commands:\n' + [...commands.values()].map(command => inlineCode(command.toString())).join('\n')
    };
  }
}
