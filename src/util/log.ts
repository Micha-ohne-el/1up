import {FormatterFunction, LevelName, HandlerOptions, BaseHandler} from '/deps/log.ts';
import {Thyme} from '/deps/thyme.ts';
import * as log from '/deps/log.ts';

export function debug(...parts: unknown[]) {
  log.debug(parts.map(part => Deno.inspect(part)).join(' '));
}
export function info(...parts: unknown[]) {
  log.info(parts.map(part => Deno.inspect(part)).join(' '));
}
export function warning(...parts: unknown[]) {
  log.warning(parts.map(part => Deno.inspect(part)).join(' '));
}
export function error(...parts: unknown[]) {
  log.error(parts.map(part => Deno.inspect(part)).join(' '));
}
export function critical(...parts: unknown[]) {
  log.critical(parts.map(part => Deno.inspect(part)).join(' '));
}

export const formatLogMessage: FormatterFunction = ({datetime, levelName, loggerName, msg}) => {
  const time = new Thyme(datetime);
  return `${time.formatSimple('YYYYMMDD-hh:mm:ss.iii')} – ${loggerName}/${levelName}: ${msg}`;
}

/**
  Stores log records in a statically-sized array to be retrieved later.
*/
export class MemoryHandler extends BaseHandler {
  limit: number;

  constructor(levelName: LevelName, options: MemoryHandlerOptions) {
    super(levelName, options);

    this.limit = options.limit;
    this.logs = new Array<string>(this.limit);
  }

  override log(msg: string): void {
    this.logs[this.index] = msg;

    this.index = this.getIndexPlus(1);
  }

  get retriever() {
    return this as LogRetriever;
  }

  /**
    Retrieve the Nth last log entry.
    @param index The index into the log history. `0` is the most recent entry.
    @throws `IndexOutOfBoundsException` when `index > this.limit`.
  */
  get(index: number) {
    return this.logs[this.getIndexPlus(-index - 1)];
  }

  private logs: (string | undefined)[];
  private index = 0;
  private getIndexPlus(factor: number) {
    return ((this.index + factor) % this.limit + this.limit) % this.limit;
  }
}

export interface MemoryHandlerOptions extends HandlerOptions {
  limit: number;
}

interface LogRetriever {
  get(index: number): string | undefined;
}

export const memoryHandler = new MemoryHandler('DEBUG', {limit: 1000, formatter: formatLogMessage});

export const logMemory = {
  get(amount: number, pattern?: RegExp) {
    const memory = memoryHandler.retriever;

    const entries: string[] = [];

    for (let i = 0; i < amount; i++) {
      const entry = memory.get(i);

      if (entry === undefined) {
        break;
      }

      if (pattern && !pattern.test(entry)) {
        continue;
      }

      entries.unshift(entry);
    }

    return entries;
  }
};

log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler('DEBUG', {formatter: formatLogMessage}),
    file: new log.handlers.FileHandler('INFO', {filename: 'logs', formatter: formatLogMessage}),
    memory: memoryHandler
  },
  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['console', 'file', 'memory']
    }
  }
})
