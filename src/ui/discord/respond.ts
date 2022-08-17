import {Bot, sendMessage, addReaction} from '/deps/discordeno.ts';
import {MessageContext} from '/business/message-context.ts';
import {Response} from '/business/commands.ts';
import {trySequentially} from '/util/try-sequentially.ts';
import {mentionUser} from '/business/mention.ts';

export async function respond(bot: Bot, response: Response, context: MessageContext) {
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
