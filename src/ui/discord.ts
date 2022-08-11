import {createBot, startBot, Intents, addReaction, sendMessage, Message, getUser} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {handleMessage} from '/business/handle-message.ts';
import {handleCommand, CommandContext, Response} from '/business/handle-command.ts';
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
            await handleCommandMessage(message);
          } else {
            await handleMessage(message.authorId, message.guildId!, message.channelId, message.member?.roles ?? []);
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

async function handleCommandMessage(message: Message) {
  const context: CommandContext = {
    text: message.content,
    guildId: message.guildId,
    userId: message.authorId,
    channelId: message.channelId,
    roleIds: message.member?.roles ?? []
  };

  const response = await handleCommand(context);

  if (!response) {
    return;
  }

  await respond(response);

  async function respond(response: Response) {
    const indicator = response.success === undefined ? '' : response.success ? '✅' : '❌';

    if (response.message !== undefined) {
      await trySequentially(
        async () => await sendMessage(bot, message.channelId, {
          content: [indicator, response.message].join(' '),
          messageReference: {
            messageId: message.id,
            guildId: message.guildId,
            channelId: message.channelId,
            failIfNotExists: true
          }
        }),
        async () => await sendMessage(bot, message.channelId, {
          content: [indicator, mentionUser(message.authorId), response.message].join(' ')
        }),
        async () => await addReaction(bot, message.channelId, message.id, indicator)
      );
    } else if (indicator) {
      await addReaction(bot, message.channelId, message.id, indicator);
    }
  }
}
