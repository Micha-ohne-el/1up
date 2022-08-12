import {getXp, getGlobalXp, awardXp} from './db.ts';

export async function getXpOfUserInGuild(guildId: bigint, userId: bigint) {
  return (await getXp(userId, guildId))[0]['xp'];
}

export async function getXpOfUserGlobally(userId: bigint) {
  return (await getGlobalXp(userId)).reduce((sum, row) => sum + row['xp'], 0);
}

export async function awardXpToUserInGuild(guildId: bigint, userId: bigint, amount: number) {
  await awardXp(guildId, userId, amount);
}
