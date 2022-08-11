export function trySequentially(...functions: (() => void)[]) {
  for (const func of functions) {
    try {
      func();
    } catch {
      continue;
    }

    break;
  }
}

export function trySequentiallyAndLog(...functions: (() => void)[]) {
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
