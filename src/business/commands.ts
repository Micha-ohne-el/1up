import {bigintOrUndefined} from '../util/bigint-or-undefined.ts';
import {codeBlock, inlineCode} from './wrap.ts';
import {MessageContext} from '/business/message-context.ts';
import {getOwnerId} from '/util/secrets.ts';

export const commands = new Set<Command>();

export abstract class Command<T = any> {
  $name!: string;
  $params!: Map<string, Param<T>>;
  $privilegeLevel!: PrivilegeLevel;

  init() {
    this.$name = this.$name ?? this.constructor.name;
    this.$params = this.$params ?? new Map<string, Param<T>>();
    this.$privilegeLevel = new Everyone();
  }

  abstract invoke(context: MessageContext): Promise<Response> | Response;

  async call(text: string, context: MessageContext) {
    const params = this.parseToParams(text);

    for (const [name, param] of this.$params) {
      this[name] = await param.match(params.shift(), context);
    }

    if (params.length !== 0) {
      throw new ExtraParamError(params.join(' '));
    }

    if (!this.$privilegeLevel.check(context)) {
      throw new PermissionError(this.$privilegeLevel);
    }

    return await this.invoke(context);
  }

  toString() {
    const parts = [this.$name, ...this.$params.values()];

    return codeBlock(parts.join(' '));
  }

  toErrorMessage(param: Param<unknown>) {
    const parts = [this.$name, ...this.$params.values()];
    const underlines = parts.map(part => (part === param ? '~' : ' ').repeat(part.toString().length));

    return codeBlock(parts.join(' ') + '\n' + underlines.join(' '));
  }

  [key: string]: unknown;

  private parseToParams(text: string) {
    const params: string[] = [];

    let escaped = false;
    let quote: '"' | "'" | '' = '';

    let token = '';
    for (const char of text) {
      if (escaped) {
        escaped = false;
        token += char;
      }

      else if (char === '\\') {
        escaped = true;
      }

      else if (char === quote) {
        quote = '';
        params.push(token);
        token = '';
      }

      else if (char === '"' || char === "'") {
        quote = char;
      }

      else if (!quote && /\s+/.test(char)) {
        params.push(token);
        token = '';
      }

      else {
        token += char;
      }
    }
    if (token) {
      params.push(token);
    }

    return params.slice(1);
  }
}

abstract class ParamType<T = unknown> {
  abstract match(text: string, context: MessageContext): Promise<T | undefined> | T | undefined;

  toString() {
    return this.constructor.name;
  }
}

export class Float extends ParamType<number> {
  override match(text: string) {
    const number = Number.parseFloat(text);

    if (Number.isFinite(number)) {
      return number;
    }
  }
}

export class Int extends ParamType<number> {
  override match(text: string) {
    const number = Number.parseInt(text, 10);

    if (Number.isFinite(number)) {
      return number;
    }
  }
}

export class Text extends ParamType<string> {
  override match(text: string) {
    return text || undefined;
  }
}

export class RegularExpression extends ParamType<RegExp> {
  override match(text: string) {
    try {
      return new RegExp(text, 'm');
    } catch {
      return undefined;
    }
  }
}

export class Guild extends ParamType<bigint> {
  override async match(text: string, {checks}: MessageContext) {
    const id = bigintOrUndefined(text);

    if (id !== undefined && await checks.isGuild(id)) {
      return id;
    }
  }
}

export class User extends ParamType<bigint> {
  override async match(text: string, {checks}: MessageContext) {
    const id = bigintOrUndefined(text)
      ?? bigintOrUndefined(text.match(/<@(\d+)>/)?.[1]);

    if (id !== undefined && await checks.isUser(id)) {
      return id;
    }
  }
}

export class Channel extends ParamType<bigint> {
  override async match(text: string, {checks}: MessageContext) {
    const id = bigintOrUndefined(text)
      ?? bigintOrUndefined(text.match(/<#(\d+)>/)?.[1]);

    if (id !== undefined && await checks.isChannel(id)) {
      return id;
    }
  }
}

/**
  Note that roles are not reified and, thus, any ID can be used as a role.
  You should use MessageContext.checks.isRole to verify whether an actual role was supplied.
*/
export class Role extends ParamType<bigint> {
  override match(text: string) {
    return bigintOrUndefined(text)
      ?? bigintOrUndefined(text.match(/<@&(\d+)>/)?.[1]);
  }
}

class Literal extends ParamType<string> {
  constructor(private text: string) {
    super();
  }

  override match(text: string) {
    if (text === this.text) {
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

export function availableTo(privilegeLevel: new () => PrivilegeLevel) {
  return (target: new () => Command) => {
    const prototype = target.prototype as Command;

    prototype.init();

    prototype.$privilegeLevel = new privilegeLevel;
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

    const result = await this.matchTypes(text, context);

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

  private async matchTypes(text: string, context: MessageContext) {
    for (const type of this.types) {
      const value = await type.match(text, context);

      if (value !== undefined) {
        return value;
      }
    }
  }
}

export interface PrivilegeLevel {
  check(context: MessageContext): boolean;
}

export class Everyone implements PrivilegeLevel {
  check() {
    return true;
  }
}

export class Moderator implements PrivilegeLevel {
  check() {
    return false; // TODO: Implement.
  }
}

export class ServerOwner implements PrivilegeLevel {
  check() {
    return false; // TODO: Implement.
  }
}

export class BotOwner implements PrivilegeLevel {
  check(context: MessageContext) {
    return context.authorId === getOwnerId();
  }
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
    super(`${message} Specifically: ${inlineCode(String(specifics))}`);
  }
}

export class ExtraParamError extends ParamError {
  override param = undefined;

  constructor(public value: unknown, message: string = 'Extra value passed, when none was expected.') {
    const errorMessage = value === undefined ? message : `${message} Specifically: ${inlineCode(String(value))}`;
    super(errorMessage);
  }
}

export class PermissionError extends Error {
  constructor(privilegeLevel?: PrivilegeLevel) {
    const message = privilegeLevel ?
      `You need to be of privilege level ${privilegeLevel.constructor.name} to run this command.` :
      'You are not allowed to run this command.';

    super(message);
  }
}
