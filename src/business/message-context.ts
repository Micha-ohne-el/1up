export interface MessageContext {
  messageId: bigint;
  guildId?: bigint;
  authorId: bigint;
  channelIds: bigint[];
  roleIds: bigint[];
  checks: {
    canEdit(id: bigint): Promise<boolean>;
    isUser(id: bigint): Promise<boolean>;
    isRole(id: bigint, guildId?: bigint): Promise<boolean>;
    isChannel(id: bigint): Promise<boolean>;
    isGuild(id: bigint): Promise<boolean>;
    isGuildOwner(userId: bigint): Promise<boolean>;
  }
}
