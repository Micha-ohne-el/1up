import {Bot, sendMessage, addReaction, CreateMessage} from '/deps/discordeno.ts';
import {MessageContext} from '/business/message-context.ts';
import {Response} from '/business/commands.ts';
import {trySequentially} from '/util/try-sequentially.ts';
import {mentionUser} from '/business/mention.ts';

export async function respond(bot: Bot, response: Response, context: MessageContext) {
  const indicator = response.success === undefined ? '' : response.success ? '✅' : '❌';

  if (response.message !== undefined) {
    await trySequentially(
      async () => {
        const content = [indicator, response.message].join(' ').trim();

        const message: CreateMessage = {
          messageReference: {
            messageId: context.messageId,
            guildId: context.guildId,
            channelId: context.channelIds[0],
            failIfNotExists: true
          }
        }

        if (content.length > 2000) {
          message.file = {name: 'too-long.txt', blob: new Blob([content])};
        } else {
          message.content = content;
        }

        await sendMessage(bot, context.channelIds[0], message);
      },
      async () => {
        const content = [indicator, mentionUser(context.authorId), response.message].join(' ').trim();

        if (content.length > 2000) {
          await sendMessage(bot, context.channelIds[0], {file: {name: 'too-long.txt', blob: new Blob([content])}});
        } else {
          await sendMessage(bot, context.channelIds[0], {content});
        }
      },
      async () => await addReaction(bot, context.channelIds[0], context.messageId, indicator)
    );
  } else if (indicator) {
    await addReaction(bot, context.channelIds[0], context.messageId, indicator);
  }
}
