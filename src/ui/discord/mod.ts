import {createBot, startBot, Intents, Message, getUser, getChannel, removeRole, addRole, getRoles} from '/deps/discordeno.ts';
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
      },
      debug: (...args) => debug('debug', ...args)
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

  const oldRoleId = await getLevelRoleId(context.guildId!, oldLevel);
  const newRoleId = await getLevelRoleId(context.guildId!, newLevel);
  const levelRoleIds = (await getLevelRoleIds(context.guildId!)).map(entry => entry.roleId);

  if (!(context.roleIds as (bigint | undefined)[]).includes(oldRoleId)) {
    info(`Level roles for user ${context.authorId} have desynced.`);
  }

  const excessRoles = levelRoleIds.filter(id => id !== newRoleId && context.roleIds.includes(id))

  info('Attempting to remove the following roles:', excessRoles);

  for (const roleId of excessRoles) {
    try {
      await removeRole(bot, context.guildId!, context.authorId, roleId, 'Level up!');
      info(`Removed role ${roleId} from ${context.authorId}.`);
    } catch (e: unknown) {
      error(e);
    }
  }
  if (newRoleId) {
    if (context.roleIds.includes(newRoleId)) {
      info(`User already has newRoleId:`, newRoleId);
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
    canEdit(_id: bigint) {
      if (message.authorId === getOwnerId()) {
        return true;
      }

      return false;
    },
    async isRole(id) {
      const roles = await getRoles(bot, message.guildId ?? 0n);

      return roles.has(id);
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
