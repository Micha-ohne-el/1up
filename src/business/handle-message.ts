import {getRandomNumber} from '/util/random.ts';
import {awardXpToUserInGuild} from '/data/xp.ts';
import {getGuildXpRange, getChannelXpMultiplier, getCategoryXpMultiplier, getRoleXpMultiplier} from '/data/multipliers.ts';
import {MessageContext} from '/business/message-context.ts';

export async function handleMessage({authorId, guildId, channelId, categoryId, roleIds}: MessageContext) {
  if (!guildId) {
    return;
  }

  const range = await getGuildXpRange(guildId);
  const rawXp = getRandomNumber(...range);

  const channelMultiplier = await getChannelXpMultiplier(channelId);
  const categoryMultiplier = categoryId ? await getCategoryXpMultiplier(categoryId) : 1;
  const roleMultipliers = await Promise.all(roleIds.map(getRoleXpMultiplier));

  const xp = [channelMultiplier, categoryMultiplier, ...roleMultipliers].reduce((sum, val) => sum * val, rawXp);

  console.log({range, rawXp, channelMultiplier, categoryMultiplier, roleMultipliers, xp});

  await awardXpToUserInGuild(guildId, authorId, xp);
}
