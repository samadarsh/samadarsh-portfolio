/**
 * Whether the intro loader has finished leaving the screen, so hero animations can wait for it
 * instead of playing behind it. When the loader is skipped, the intro counts as done at once.
 */

let done = false;
const waiting = new Set<() => void>();

export function markIntroDone() {
  done = true;
  waiting.forEach((cb) => cb());
  waiting.clear();
}

/** Runs `cb` once the intro is done (straight away if it already is). Returns a cancel function. */
export function whenIntroDone(cb: () => void) {
  if (done) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  return () => waiting.delete(cb);
}
