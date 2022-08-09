import {setXpMultiplier} from "../data/multipliers.ts";

export async function handleCommand(content: string): Promise<Response | void> {
  for (const [name, command] of Object.entries(commands)) {
    const pos = content.toLowerCase().indexOf(name.toLowerCase());

    if (pos === -1) {
      continue;
    }

    return await command(content.slice(pos));
  }
}

export interface Response {
  success?: boolean;
  message?: string;
}

const commands: Record<string, (text: string) => Promise<Response>> = {
  async setMultiplier(text: string) {
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
  }
};
