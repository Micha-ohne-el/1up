import '/deps/dotenv-load.ts';

import {handlers, setup, formatLogMessage} from '/deps/log.ts';
import {memoryHandler} from '/util/log-memory.ts';
import {connect} from '/ui/discord/mod.ts';

setup({
  handlers: {
    console: new handlers.ConsoleHandler('DEBUG', {formatter: formatLogMessage}),
    file: new handlers.FileHandler('WARNING', {filename: 'logs', formatter: formatLogMessage}),
    memory: memoryHandler
  },
  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['console', 'file', 'memory']
    }
  }
})

connect();
