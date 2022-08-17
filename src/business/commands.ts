import {inlineCode} from './wrap.ts';
import {MessageContext} from '/business/message-context.ts';

export const commands = new Set<Command>();

export abstract class Command<T = any> {
  $name!: string;
  $params!: Map<string, Param<T>>;

  init() {
    this.$name = this.$name ?? this.constructor.name;
    this.$params = this.$params ?? new Map<string, Param<T>>();
  }

  abstract invoke(context: MessageContext): Promise<Response> | Response;

  async call(text: string, context: MessageContext) {
    const params = text.split(' ').slice(1);

    for (const [name, param] of this.$params) {
      this[name] = await param.match(params.shift(), context);
    }

    if (params.length !== 0) {
      throw new ExtraParamError(params.join(' '));
    }

    return await this.invoke(context);
  }

  [key: string]: unknown;
}

abstract class ParamType<T = unknown> {
  abstract match(text: string): T | undefined;

  toString() {
    return this.constructor.name;
  }
}

export class Float extends ParamType<number> {
  override match(text: string) {
    return Number.parseFloat(text);
  }
}

export class Int extends ParamType<number> {
  override match(text: string) {
    return Number.parseInt(text, 10);
  }
}

export class Guild extends ParamType<bigint> {
  override match(text: string) {
    try {
      return BigInt(text);
    } catch {
      return undefined;
    }
  }
}

export class User extends ParamType<bigint> {
  override match(text: string) {
    try {
      return BigInt(text);
    } catch {
      const match = text.match(/<@(\d+)>/)?.[1];

      if (!match) {
        return undefined;
      }

      try {
        return BigInt(match);
      } catch {
        return undefined;
      }
    }
  }
}

export class Channel extends ParamType<bigint> {
  override match(text: string) {
    try {
      return BigInt(text);
    } catch {
      const match = text.match(/<#(\d+)>/)?.[1];

      if (!match) {
        return undefined;
      }

      try {
        return BigInt(match);
      } catch {
        return undefined;
      }
    }
  }
}

export class Role extends ParamType<bigint> {
  override match(text: string) {
    try {
      return BigInt(text);
    } catch {
      const match = text.match(/<@&(\d+)>/)?.[1];

      if (!match) {
        return undefined;
      }

      try {
        return BigInt(match);
      } catch {
        return undefined;
      }
    }
  }
}

class Literal extends ParamType<string> {
  constructor(private text: string) {
    super();
  }

  override match(text: string) {
    if (text === this.text || text === `'${this.text}'` || text === `"${this.text}"`) {
      return this.text;
    }
  }

  override toString() {
    return `'${this.text}'`;
  }
}

export function command(name?: string) {
  return (target: new () => Command) => {
    const prototype = target.prototype as Command;

    prototype.init();

    if (name !== undefined) {
      prototype.$name = name;
    }

    commands.add(prototype);
  };
}

export function param(...types: ((new () => ParamType) | string)[]) {
  return (target: Command, key: string) => {
    target.init();

    const param = target.$params!.get(key) ?? new Param(key);

    param.types = types.map(type => typeof type === 'string' ? new Literal(type) : new type);

    target.$params!.set(key, param);
  };
}

export function optional() {
  return (target: Command, key: string) => {
    target.init();

    const param = target.$params!.get(key) ?? new Param(key);

    param.isOptional = true;

    target.$params!.set(key, param);
  };
}

export function require<T>(validator: (value: T, context: MessageContext) => boolean | Promise<boolean>) {
  return (target: Command<T>, key: string) => {
    target.init();

    const param = target.$params!.get(key) ?? new Param(key);

    param.validator = validator;

    target.$params!.set(key, param);
  };
}

export class Param<T> {
  name: string;
  types: ParamType<T>[] = [];
  privilegeLevel: PrivilegeLevel = PrivilegeLevel.Everyone;
  isOptional = false;
  validator(_value: T, _context: MessageContext): boolean | Promise<boolean> {
    return true;
  }

  constructor(name: string) {
    this.name = name;
  }

  async match(text: string | undefined, context: MessageContext): Promise<T | undefined> {
    if (text === undefined) {
      if (this.isOptional) {
        return undefined;
      } else {
        throw new BadParamError(this, text, 'This parameter is required, but you did not pass a value for it.');
      }
    }

    const result = this.matchTypes(text);

    if (result === undefined) {
      throw new BadParamError(this, text, 'Value has the wrong type for this parameter.')
    }

    // TODO: Needs a way to write specific error messages, like “value must be greater than 0” or similar.
    if (!await this.validator(result, context)) {
      throw new BadParamError(this, text, 'Value cannot be used for this parameter.');
    }

    return result;
  }

  toString() {
    const content = this.name + ': ' + this.types.join(' | ');

    if (this.isOptional) {
      return `[${content}]`;
    } else {
      return `<${content}>`;
    }
  }

  private matchTypes(text: string) {
    for (const type of this.types) {
      const value = type.match(text);

      if (value !== undefined) {
        return value;
      }
    }
  }
}

export enum PrivilegeLevel {
  Everyone,
  Moderator,
  ServerOwner,
  BotOwner
}

export interface Response {
  success?: boolean;
  message?: string;
}

export abstract class ParamError<T = unknown> extends Error {
  abstract param?: Param<T>;
  abstract value?: unknown;
}

export class BadParamError<T = unknown> extends ParamError<T> {
  constructor(public param: Param<T>, public value?: unknown, message: string = 'Bad value passed for Param.') {
    const specifics = value === undefined ? param.name : value;
    super(`${message} Specifically: ${inlineCode`${specifics}`}`);
  }
}

export class ExtraParamError extends ParamError {
  override param = undefined;

  constructor(public value: unknown, message: string = 'Extra value passed, when none was expected.') {
    const errorMessage = value === undefined ? message : `${message} Specifically: ${inlineCode`${value}`}`;
    super(errorMessage);
  }
}
