import '/deps/dotenv-load.ts';

import {handlers, setup, formatLogMessage} from '/deps/log.ts';
import {memoryHandler} from '/util/log-memory.ts';
import {connect} from '/ui/discord/mod.ts';

setup({
  handlers: {
    console: new handlers.ConsoleHandler('DEBUG', {formatter: formatLogMessage}),
    memory: memoryHandler
  },
  loggers: {
    default: {
      level: 'DEBUG',
      handlers: ['console', 'memory']
    }
  }
})

connect();
