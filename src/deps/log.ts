export * from 'https://deno.land/std@0.152.0/log/mod.ts';
import {FormatterFunction, LevelName, HandlerOptions} from 'https://deno.land/std@0.152.0/log/mod.ts';
import {BaseHandler} from 'https://deno.land/std@0.152.0/log/handlers.ts';
import {Thyme} from 'https://deno.land/x/thyme@0.1.1/mod.ts';

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
