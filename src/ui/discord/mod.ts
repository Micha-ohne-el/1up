import {createBot, startBot, Intents, Message, getUser, getChannel, removeRole, addRole, getRoles, getGuild} from '/deps/discordeno.ts';
import {getBotToken, getOwnerId} from '/util/secrets.ts';
import {MessageContext} from '/business/message-context.ts';
import {handleMessage, Update, shouldUpdate} from '/business/handle-message.ts';
import {formatUser} from '/ui/discord/format-user.ts';
import {respond} from '/ui/discord/respond.ts';
import {handleCommand} from '/business/handle-command.ts';
import {getLevelRoleId, getLevelRoleIds} from '/data/roles.ts';
import {info, error, debug} from '/util/log.ts';

export async function connect() {
  await startBot(bot);
}

const botToken = getBotToken();

const bot = createBot(
  {
    token: botToken,
    intents: Intents.MessageContent
      | Intents.GuildMessages | Intents.GuildMessageReactions
      | Intents.DirectMessages | Intents.DirectMessageReactions,
    events: {
      async ready(bot) {
        info(`Successfully logged in!`);
        info(`Bot User: ${formatUser(await getUser(bot, bot.id))}`);
      },
      async messageCreate(bot, message) {
        if (message.isBot || message.authorId === bot.id) {
          debug('Message ignored because its author is a bot.', message);
          return;
        }

        try {
          const context = await getContextFromMessage(message)
          if (isCommandMessage(message)) {
            await handleCommandMessage(message.content, context);
          } else {
            const update = await handleMessage(context);

            if (update && shouldUpdate(update)) {
              await handleUpdate(update, context);
            }
          }
        } catch (e: unknown) {
          error(e);
        }
      }
    }
  }
);

function isCommandMessage(message: Message) {
  return message.guildId === undefined || message.mentionedUserIds.includes(bot.id)
}

async function handleCommandMessage(text: string, context: MessageContext) {
  const response = await handleCommand(text, context);

  if (!response) {
    return;
  }

  await respond(bot, response, context);
}

async function handleUpdate({oldLevel, newLevel}: Update, context: MessageContext) {
  info(`Updating roles for user ${context.authorId} in guild ${context.guildId} (${oldLevel} => ${newLevel})...`);

  const oldRoleIdPromise = getLevelRoleId(context.guildId!, oldLevel);
  const newRoleIdPromise = getLevelRoleId(context.guildId!, newLevel);
  const levelRoleIdsPromise = getLevelRoleIds(context.guildId!);

  const [oldRoleId, newRoleId, levelRoleIds] = await Promise.all([oldRoleIdPromise, newRoleIdPromise, levelRoleIdsPromise]);

  if (!(context.roleIds as (bigint | undefined)[]).includes(oldRoleId)) {
    info(`Level roles for user ${context.authorId} have desynced.`);
  }

  const excessRoles = levelRoleIds.filter(({roleId}) => roleId !== newRoleId && context.roleIds.includes(roleId))

  info('Attempting to remove the following roles:', excessRoles);

  await Promise.all(
    excessRoles.map(
      async ({roleId}) => {
        try {
          await removeRole(bot, context.guildId!, context.authorId, roleId, 'Level up!');
          info(`Removed role ${roleId} from ${context.authorId}.`);
        } catch (e: unknown) {
          error(e);
        }
      }
    )
  );

  if (newRoleId) {
    if (context.roleIds.includes(newRoleId)) {
      info(`User already has newRoleId (${newRoleId}), skipping.`);
      return;
    }

    try {
      await addRole(bot, context.guildId!, context.authorId, newRoleId, 'Level up!');
      info(`Added role ${newRoleId} to ${context.authorId}.`);
    } catch (e: unknown) {
      error(e);
    }
  }
}

async function getContextFromMessage(message: Message): Promise<MessageContext> {
  return {
    messageId: message.id,
    authorId: message.authorId,
    guildId: message.guildId,
    channelIds: await getChannelHierarchy(message.channelId),
    roleIds: message.member?.roles ?? [],
    checks: {
      async canEdit(_id: bigint) {
        return message.authorId === getOwnerId();
      },
      async isUser(id) {
        return getUser(bot, id) !== undefined;
      },
      async isRole(id, guildId) {
        if (!guildId && !message.guildId) {
          return false;
        }

        const roles = await getRoles(bot, guildId ?? message.guildId!);

        return roles.has(id);
      },
      async isChannel(id) {
        return getChannel(bot, id) !== undefined;
      },
      async isGuild(id) {
        return getGuild(bot, id) !== undefined;
      },
    }
  };
}

const isChannelHierarchyEnabled = false;
async function getChannelHierarchy(channelId: bigint): Promise<bigint[]> {
  if (!isChannelHierarchyEnabled) {
    return [channelId];
  }

  let id: bigint | undefined = channelId;
  const ids = [];

  while (id) {
    ids.push(id);

    id = (await getChannel(bot, id))?.parentId;
  }

  return ids;
}
