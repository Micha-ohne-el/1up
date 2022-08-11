import {setXpMultiplier, setXpRange} from "../data/multipliers.ts";

export async function handleCommand(context: CommandContext): Promise<Response | void> {
  for (const [name, command] of Object.entries(commands)) {
    const pos = context.text.toLowerCase().indexOf(name.toLowerCase());

    if (pos === -1) {
      continue;
    }

    context.text = context.text.slice(pos);

    return await command(context);
  }
}

export interface Response {
  success?: boolean;
  message?: string;
}

const commands: Record<string, (context: CommandContext) => Promise<Response>> = {
  async setMultiplier({text}) {
    const tokens = text.split(/\s+/, 3);

    const match = tokens[1].match(/<[@#](\d+)>|(\d+)/);

    if (!match) {
      return {success: false};
    }

    const multiplier = Number.parseFloat(tokens[2]);

    if (Number.isNaN(multiplier)) {
      return {success: false};
    }

    await setXpMultiplier(BigInt(match[1] ?? match[2]), multiplier);

    return {success: true};
  },
  async setRange({guildId, text}) {
    if (!guildId) {
      return {success: false};
    }

    const tokens = text.split(/\s+/, 3);

    const first = Number.parseFloat(tokens[1]);
    const last = Number.parseFloat(tokens[2]);

    if (Number.isNaN(first) || Number.isNaN(last)) {
      return {success: false};
    }

    await setXpRange(guildId, first, last);

    return {success: true};
  }
};

export interface CommandContext {
  text: string;
  guildId: bigint | undefined;
  userId: bigint;
  channelId: bigint;
  roleIds: bigint[];
}
