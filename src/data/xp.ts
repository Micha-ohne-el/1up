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

export function getXpRequiredForLevel(level: number) {
  return 5 * level ** 2 + 50 * level + 100;
}

export function getXpFromLevel(level: number) {
  return 5 * level ** 3 / 3 + 25 * level ** 2 + 100 * level;
}

export function getLevelFromXp(xp: number) {
  let remainingXp = xp;
  let level = 0;

  while (remainingXp >= getXpRequiredForLevel(level)) {
    remainingXp -= getXpRequiredForLevel(level);
    level++;
  }

  return level;
}
