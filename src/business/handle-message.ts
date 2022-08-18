import {getRandomNumber} from '/util/random.ts';
import {awardXpAndMessagesToUserInGuild, getLevelFromXp, getXpOfUserInGuild} from '/data/xp.ts';
import {getGuildXpRange, getXpMultiplier} from '/data/multipliers.ts';
import {MessageContext} from '/business/message-context.ts';

export async function handleMessage({authorId, guildId, channelIds, roleIds}: MessageContext) {
  if (!guildId) {
    return;
  }

  const previousXp = await getXpOfUserInGuild(guildId, authorId);
  const previousLevel = getLevelFromXp(previousXp);

  const range = await getGuildXpRange(guildId);
  const rawXp = getRandomNumber(...range);

  const channelMultipliersPromise = Promise.all(channelIds.map(getXpMultiplier));
  const roleMultipliersPromise = Promise.all(roleIds.map(getXpMultiplier));

  const [channelMultipliers, roleMultipliers] = await Promise.all([
    channelMultipliersPromise, roleMultipliersPromise
  ]);

  const xp = Math.round([...channelMultipliers, ...roleMultipliers].reduce((sum, val) => sum * val, rawXp));

  await awardXpAndMessagesToUserInGuild(guildId, authorId, xp, 1);

  return {
    oldLevel: previousLevel,
    newLevel: getLevelFromXp(previousXp + xp)
  }
}

export interface Update {
  oldLevel: number;
  newLevel: number;
}

export function shouldUpdate({oldLevel, newLevel}: Update) {
  return oldLevel !== newLevel;
}
