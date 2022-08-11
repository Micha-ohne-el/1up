import {User} from '/deps/discordeno.ts';

export function formatUser(user: User): string {
  return `@${user.username}#${user.discriminator} (${user.id})`;
}
