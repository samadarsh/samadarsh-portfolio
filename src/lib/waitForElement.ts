/**
 * Resolves with the element once it exists in the DOM (or null after `timeout` ms).
 * Pages load on demand, so a section can appear a few frames after the route changes.
 */
export function waitForElement(
  id: string,
  timeout = 3000,
): { promise: Promise<HTMLElement | null>; cancel: () => void } {
  let frame = 0;
  let cancelled = false;
  const promise = new Promise<HTMLElement | null>((resolve) => {
    const start = performance.now();
    const check = () => {
      if (cancelled) return resolve(null);
      const el = document.getElementById(id);
      if (el) return resolve(el);
      if (performance.now() - start > timeout) return resolve(null);
      frame = requestAnimationFrame(check);
    };
    check();
  });
  return {
    promise,
    cancel: () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    },
  };
}
