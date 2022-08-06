import {getXpWhere, awardXp} from './db.ts';

export async function getXpOfUserInGuild(guildId: bigint, userId: bigint) {
  return (await getXpWhere({guildId, userId}))[0];
}

export async function getXpOfUserGlobally(userId: bigint) {
  return (await getXpWhere({userId})).reduce((sum, val) => sum + val, 0);
}

export async function getXpInGuild(guildId: bigint) {
  return (await getXpWhere({guildId})).reduce((sum, val) => sum + val, 0);
}

export async function awardXpToUserInGuild(guildId: bigint, userId: bigint, amount: number) {
  await awardXp(guildId, userId, amount);
}
