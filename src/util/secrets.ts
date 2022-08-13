import {InvalidBotToken, InvalidDbUsername, InvalidDbPassword, InvalidOwnerId} from '/util/errors.ts';

export function getBotToken() {
  const botToken = Deno.env.get('ONEUP_BOT_TOKEN')

  if (!botToken) {
    throw new InvalidBotToken(botToken);
  }

  return botToken;
}

export function getDbCredentials() {
  const username = Deno.env.get('ONEUP_DB_USERNAME');
  const password = Deno.env.get('ONEUP_DB_PASSWORD');

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

export function getOwnerId() {
  const ownerId = Deno.env.get('ONEUP_OWNER_ID');

  if (!ownerId) {
    return undefined;
  }

  try {
    return BigInt(ownerId);
  } catch {
    throw new InvalidOwnerId(ownerId);
  }
}
