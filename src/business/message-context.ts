export interface MessageContext {
  messageId: bigint;
  guildId?: bigint;
  channelId: bigint;
  authorId: bigint;
  roleIds: bigint[];
  categoryId?: bigint;
}
