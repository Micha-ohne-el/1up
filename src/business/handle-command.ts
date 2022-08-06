import {setXpMultiplier} from "../data/multipliers.ts";

export async function handleCommand(content: string): Promise<Status | void> {
  for (const [name, command] of Object.entries(commands)) {
    const pos = content.toLowerCase().indexOf(name.toLowerCase());

    if (pos === -1) {
      continue;
    }

    return await command(content.slice(pos));
  }
}

export type Status = BooleanStatus | ReplyStatus;

export interface BooleanStatus {
  success: boolean;
}
export function isBooleanStatus(status: Status): status is BooleanStatus {
  return 'success' in status && typeof status.success === 'boolean';
}

export interface ReplyStatus {
  message: string;
}
export function isReplyStatus(status: Status): status is ReplyStatus {
  return 'message' in status && typeof status.message === 'string';
}

const commands: Record<string, (text: string) => Promise<Status>> = {
  async setMultiplier(text: string) {
    const tokens = text.split(/\s+/, 5);

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
