import {getRandomNumber} from '/util/random.ts';
import {awardXpToUserInGuild} from '/data/xp.ts';
import {getGuildXpRange, getChannelXpMultiplier, getRoleXpMultiplier} from '/data/multipliers.ts';
import {MessageContext} from '/business/message-context.ts';

export async function handleMessage({authorId, guildId, channelIds, roleIds}: MessageContext) {
  if (!guildId) {
    return;
  }

  const range = await getGuildXpRange(guildId);
  const rawXp = getRandomNumber(...range);

  const channelMultipliersPromise = Promise.all(channelIds.map(getChannelXpMultiplier));
  const roleMultipliersPromise = Promise.all(roleIds.map(getRoleXpMultiplier));

  const [channelMultipliers, roleMultipliers] = await Promise.all([
    channelMultipliersPromise, roleMultipliersPromise
  ]);

  const xp = [...channelMultipliers, ...roleMultipliers].reduce((sum, val) => sum * val, rawXp);

  console.log({range, rawXp, channelMultipliers, roleMultipliers, xp});

  await awardXpToUserInGuild(guildId, authorId, xp);
}
