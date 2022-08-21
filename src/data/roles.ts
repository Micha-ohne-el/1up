import {bigintOrUndefined} from '/util/bigint-or-undefined.ts';
import {clearRoleForLevel, getRoleForLevel, getRoles, setRoleForLevel} from './db.ts';

export async function getLevelRoleId(guildId: bigint, level: number): Promise<bigint | undefined> {
  return bigintOrUndefined((await getRoleForLevel(guildId, level))?.[0]?.['roleid']);
}

export async function setLevelRoleId(guildId: bigint, level: number, roleId: bigint) {
  await setRoleForLevel(guildId, level, roleId);
}

export async function clearLevelRoleId(guildId: bigint, level: number) {
  await clearRoleForLevel(guildId, level);
}

export async function getLevelRoleIds(guildId: bigint): Promise<{level: number; roleId: bigint}[]> {
  return (await getRoles(guildId)).map(row => ({level: row['level'], roleId: bigintOrUndefined(row['roleid'])!}));
}
