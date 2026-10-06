/**
 * Lets the hero tagline start writing once the name has finished denoising (DiffusionName).
 * Resets each time the hero mounts, since the name plays again on every visit to the home page.
 */

let shown = false;
const waiting = new Set<() => void>();

export function resetNameShown() {
  shown = false;
}

export function markNameShown() {
  shown = true;
  waiting.forEach((cb) => cb());
  waiting.clear();
}

/** Runs `cb` once the name is on screen (straight away if it already is). Returns a cancel function. */
export function whenNameShown(cb: () => void) {
  if (shown) {
    cb();
    return () => {};
  }
  waiting.add(cb);
  return () => waiting.delete(cb);
}
