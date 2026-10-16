/**
 * A deploy replaces the site's hashed script files, so a visitor who already has a page open can
 * ask for a file that no longer exists (or a phone on a weak signal can simply fail to fetch one).
 * Vite reports that as `vite:preloadError`. The first time it happens we reload, which picks up the
 * current files; if it happens again straight after, we stop and let the error boundary show a
 * message with a Reload button instead of looping.
 */

const KEY = 'portfolio-chunk-reload';
const WINDOW_MS = 15_000;

const reloadedRecently = () => {
  try {
    return Date.now() - Number(sessionStorage.getItem(KEY) ?? 0) < WINDOW_MS;
  } catch {
    return true; // storage blocked: don't risk a reload loop
  }
};

export function recoverFromStaleChunks() {
  window.addEventListener('vite:preloadError', (event) => {
    if (reloadedRecently()) return; // let it throw; ChunkErrorBoundary takes over
    event.preventDefault();
    try {
      sessionStorage.setItem(KEY, String(Date.now()));
    } catch {
      // unreachable: reloadedRecently() already returned true when storage throws
    }
    window.location.reload();
  });
}
