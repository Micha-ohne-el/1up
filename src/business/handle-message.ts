import {getRandomNumber} from '/util/random.ts';
import {awardXpToUserInGuild} from '/data/xp.ts';
import {getGuildXpRange, getChannelXpMultiplier, getRoleXpMultiplier} from '/data/multipliers.ts';
import {MessageContext} from '/business/message-context.ts';

export async function handleMessage({authorId, guildId, channelId, roleIds}: MessageContext) {
  if (!guildId) {
    return;
  }

  const range = await getGuildXpRange(guildId);
  const rawXp = getRandomNumber(...range);

  const channelMultiplier = await getChannelXpMultiplier(channelId);
  const roleMultipliers = await Promise.all(roleIds.map(getRoleXpMultiplier));

  const xp = [channelMultiplier, ...roleMultipliers].reduce((sum, val) => sum * val, rawXp);

  console.log({range, rawXp, channelMultiplier, roleMultipliers, xp});

  await awardXpToUserInGuild(guildId, authorId, xp);
}
