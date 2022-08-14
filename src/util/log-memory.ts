import {formatLogMessage, MemoryHandler} from '/deps/log.ts';

export const memoryHandler = new MemoryHandler('DEBUG', {limit: 1000, formatter: formatLogMessage});

export const logMemory = {
  get(amount: number) {
    const memory = memoryHandler.retriever;

    const entries: string[] = [];

    for (let i = 0; i < amount; i++) {
      const entry = memory.get(i);

      if (entry === undefined) {
        break;
      }

      entries.unshift(entry);
    }

    return entries;
  }
};
