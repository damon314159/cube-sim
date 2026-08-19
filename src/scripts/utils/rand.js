// Returns a random integer from a to b inclusive
export function randInt(a, b) {
  const range = Math.abs(b - a) + 1; // e.g. 10-14 inclusive is actually 5 distinct options we want to be equally likely
  const delta = Math.floor(Math.random() * range);
  const lower = Math.min(a, b);
  return lower + delta;
}
