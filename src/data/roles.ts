import {getRoleForLevel, setRoleForLevel} from './db.ts';

export async function getLevelRoleId(guildId: bigint, level: number): Promise<bigint | undefined> {
  return (await getRoleForLevel(guildId, level))?.[0]?.['roleid'] || undefined;
}

export async function setLevelRoleId(guildId: bigint, level: number, roleId: bigint) {
  await setRoleForLevel(guildId, level, roleId);
}
