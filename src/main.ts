import {createBot, startBot, Intents} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {awardXp, getAll} from '/db.ts';

const botToken = getBotToken();

const bot = createBot(
  {
    token: botToken,
    intents: Intents.GuildMessages,
    events: {
      async ready(bot) {
        console.log(`Successfully logged in with ID ${bot.id}`);

        console.table(await getAll());
      },
      async messageCreate(bot, message) {
        if (message.isBot || message.authorId === bot.id) {
          return;
        }

        console.table(await awardXp(message.guildId!, message.authorId, Math.random() * 4 + 1));
      }
    }
  }
);

await startBot(bot);
