import {createBot, startBot, Intents} from '/deps/discordeno.ts';
import {getBotToken} from '/util/secrets.ts';
import {getXp, awardXp, getAll} from '/db.ts';

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
      async messageCreate(_bot, message) {
        await awardXp(message.guildId!, message.authorId, Math.random() * 4 + 1);

        console.table(await getXp(message.guildId!, message.authorId));
      }
    }
  }
);

await startBot(bot);
