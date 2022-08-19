import {debug, warning} from '/util/log.ts';

export async function trySequentially(...functions: (() => Promise<unknown>)[]) {
  for (const func of functions) {
    try {
      debug(func.toString());
      await func();
    } catch (error: unknown) {
      warning(error);

      continue;
    }

    break;
  }
}

export function trySequentiallySync(...functions: (() => unknown)[]) {
  for (const func of functions) {
    try {
      debug(func.toString());
      func();
    } catch (error: unknown) {
      warning(error);

      continue;
    }

    break;
  }
}
