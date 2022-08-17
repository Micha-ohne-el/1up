import {User, Role} from '/deps/discordeno.ts';

export function mentionUser(userId: bigint): string;
export function mentionUser(user: User): string;
export function mentionUser(user: User | bigint): string {
  const userId = typeof user === 'bigint' ? user : user.id;

  return `<@${userId}>`;
}

export function mentionRole(roleId: bigint): string;
export function mentionRole(role: Role): string;
export function mentionRole(role: Role | bigint): string {
  const roleId = typeof role === 'bigint' ? role : role.id;

  return `<@&${roleId}>`;
}
