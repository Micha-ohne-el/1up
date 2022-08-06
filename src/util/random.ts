export function getRandomNumber(start: number, end: number): number {
  if (start > end) {
    [start, end] = [end, start];
  }

  return Math.random() * (end - start) + start;
}
