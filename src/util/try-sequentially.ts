export async function trySequentially(...functions: (() => Promise<unknown>)[]) {
  for (const func of functions) {
    try {
      await func();
    } catch (error: unknown) {
      console.warn(error);

      continue;
    }

    break;
  }
}

export function trySequentiallySync(...functions: (() => unknown)[]) {
  for (const func of functions) {
    try {
      func();
    } catch (error: unknown) {
      console.warn(error);

      continue;
    }

    break;
  }
}
