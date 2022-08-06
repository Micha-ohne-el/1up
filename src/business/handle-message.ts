import {getRandomNumber} from '/util/random.ts';
import {awardXpToUserInGuild} from '/data/xp.ts';
import {getGuildXpRange, getChannelXpMultiplier, getRoleXpMultiplier} from '/data/multipliers.ts';

export async function handleMessage(userId: bigint, guildId: bigint, channelId: bigint, roleIds: bigint[]) {
  const range = await getGuildXpRange(guildId);
  const rawXp = getRandomNumber(...range);

  const channelMultiplier = await getChannelXpMultiplier(channelId);
  const roleMultipliers = await Promise.all(roleIds.map(getRoleXpMultiplier));

  const xp = [channelMultiplier, ...roleMultipliers].reduce((sum, val) => sum * val, rawXp);

  console.log({range, rawXp, channelMultiplier, roleMultipliers, xp});

  await awardXpToUserInGuild(guildId, userId, xp);
}
