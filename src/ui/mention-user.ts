import {User} from '/deps/discordeno.ts';

export function mentionUser(userId: bigint): string;
export function mentionUser(user: User): string;
export function mentionUser(user: User | bigint): string {
  const userId = typeof user === 'bigint' ? user : user.id;

  return `<@${userId}>`;
}
