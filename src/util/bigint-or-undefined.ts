export function bigintOrUndefined(value: unknown) {
  try {
    if (typeof value === 'bigint' || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return BigInt(value);
    } else {
      return BigInt(String(value).valueOf());
    }
  } catch {
    return undefined;
  }
}
