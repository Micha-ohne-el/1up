export class InvalidBotToken extends Error {
  constructor(botToken: unknown) {
    super(`Invalid bot token: ${botToken}.`);
  }
}

export class InvalidDbUsername extends Error {
  constructor(dbUsername: unknown) {
    super(`Invalid bot token: ${dbUsername}.`);
  }
}

export class InvalidDbPassword extends Error {
  constructor(dbPassword: unknown) {
    super(`Invalid bot token: ${dbPassword}.`);
  }
}
