import {createBot, startBot, Intents, addReaction, sendMessage, Message} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {handleMessage} from '/business/handle-message.ts';
import {handleCommand, isBooleanStatus, isReplyStatus} from '/business/handle-command.ts';

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
      ready(bot) {
        console.log(`Successfully logged in with ID ${bot.id}`);
      },
      async messageCreate(bot, message) {
        if (message.isBot || message.authorId === bot.id) {
          return;
        }

        if (isCommandMessage(message)) {
          await handleCommandMessage(message);
        } else {
          await handleMessage(message.authorId, message.guildId!, message.channelId, message.member?.roles ?? []);
        }
      }
    }
  }
);

function isCommandMessage(message: Message) {
  return message.guildId === undefined || message.mentionedUserIds.includes(bot.id)
}

async function handleCommandMessage(message: Message) {
  const status = await handleCommand(message.content);

  if (!status) {
    return;
  }

  if (isBooleanStatus(status)) {
    await addReaction(bot, message.channelId, message.id, status.success ? '✅' : '❌');
  } else if (isReplyStatus(status)) {
    await sendMessage(bot, message.channelId, {
      content: status.message,
      messageReference: {
        ...message,
        failIfNotExists: false,
      }
    })
  }
}
