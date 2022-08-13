export interface MessageContext {
  messageId: bigint;
  guildId?: bigint;
  authorId: bigint;
  channelIds: bigint[];
  roleIds: bigint[];
  canEdit(id: bigint): boolean;
  isRole(id: bigint): Promise<boolean>;
}
