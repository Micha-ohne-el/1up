export class InvalidBotToken extends Error {
  constructor(botToken: unknown) {
    super(`Invalid bot token: ${botToken}.`);
  }
}

export class InvalidDbUsername extends Error {
  constructor(dbUsername: unknown) {
    super(`Invalid database username: ${dbUsername}.`);
  }
}

export class InvalidDbPassword extends Error {
  constructor(dbPassword: unknown) {
    super(`Invalid database password: ${dbPassword}.`);
  }
}

export class InvalidOwnerId extends Error {
  constructor(ownerId: unknown) {
    super(`Invalid owner ID: ${ownerId}.`);
  }
}
