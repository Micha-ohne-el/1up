import {createBot, startBot, Intents} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {handleMessage} from '/business/message-handler.ts';

const botToken = getBotToken();

const bot = createBot(
  {
    token: botToken,
    intents: Intents.GuildMessages,
    events: {
      ready(bot) {
        console.log(`Successfully logged in with ID ${bot.id}`);
      },
      messageCreate(bot, message) {
        if (message.isBot || message.authorId === bot.id) {
          return;
        }

        handleMessage(message.authorId, message.guildId!, message.channelId, message.member?.roles ?? []);
      }
    }
  }
);


export async function connect() {
  await startBot(bot);
}
