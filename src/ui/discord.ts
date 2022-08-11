import {createBot, startBot, Intents, addReaction, sendMessage, Message} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {handleMessage} from '/business/handle-message.ts';
import {handleCommand, CommandContext} from '/business/handle-command.ts';

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

  const success = response.success === undefined ? '' : response.success ? '✅' : '❌';

  if (response.message !== undefined) {
    await sendMessage(bot, message.channelId, {
      content: [success, response.message].join(' '),
      messageReference: {
        ...message,
        failIfNotExists: false
      }
    });
  } else if (success) {
    await addReaction(bot, message.channelId, message.id, success);
  }
}
