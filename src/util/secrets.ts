import {InvalidBotToken, InvalidDbUsername, InvalidDbPassword} from '/util/errors.ts';

export function getBotToken() {
  const botToken = Deno.env.get('1UP_BOT_TOKEN')

  if (!botToken) {
    throw new InvalidBotToken(botToken);
  }

  return botToken;
}

export function getDbCredentials() {
  const username = Deno.env.get('1UP_DB_USERNAME');
  const password = Deno.env.get('1UP_DB_PASSWORD');

  if (!password) {
    throw new InvalidDbUsername(password);
  }
  if (!password) {
    throw new InvalidDbPassword(password);
  }

  return {
    username,
    password
  };
}
