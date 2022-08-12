import {createBot, startBot, Intents, addReaction, sendMessage, Message, getUser, getChannel} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {MessageContext} from '/business/message-context.ts';
import {handleMessage} from '/business/handle-message.ts';
import {handleCommand, Response} from '/business/handle-command.ts';
import {formatUser} from '/ui/format-user.ts';
import {mentionUser} from '/ui/mention-user.ts';
import {trySequentially} from '/util/try-sequentially.ts';

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

  await respond(response);

  async function respond(response: Response) {
    const indicator = response.success === undefined ? '' : response.success ? '✅' : '❌';

    if (response.message !== undefined) {
      await trySequentially(
        async () => await sendMessage(bot, context.channelIds[0], {
          content: [indicator, response.message].join(' '),
          messageReference: {
            messageId: context.messageId,
            guildId: context.guildId,
            channelId: context.channelIds[0],
            failIfNotExists: true
          }
        }),
        async () => await sendMessage(bot, context.channelIds[0], {
          content: [indicator, mentionUser(context.authorId), response.message].join(' ')
        }),
        async () => await addReaction(bot, context.channelIds[0], context.messageId, indicator)
      );
    } else if (indicator) {
      await addReaction(bot, context.channelIds[0], context.messageId, indicator);
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
