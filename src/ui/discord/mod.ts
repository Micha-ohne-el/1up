import {createBot, startBot, Intents, Message, getUser, getChannel} from '/deps/discordeno.ts';
import {getBotToken, getOwnerId} from '/util/secrets.ts';
import {MessageContext} from '/business/message-context.ts';
import {handleMessage} from '/business/handle-message.ts';
import {formatUser} from '/ui/discord/format-user.ts';
import {respond} from '/ui/discord/respond.ts';
import {handleCommand} from '/business/handle-command.ts';

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
        console.log(`Successfully logged in!`);
        console.log(`Bot User: ${formatUser(await getUser(bot, bot.id))}`);
      },
      async messageCreate(bot, message) {
        if (message.isBot || message.authorId === bot.id) {
          return;
        }

        try {
          if (isCommandMessage(message)) {
            await handleCommandMessage(message.content, await getContextFromMessage(message));
          } else {
            await handleMessage(await getContextFromMessage(message));
          }
        } catch (error: unknown) {
          console.error(error);
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
