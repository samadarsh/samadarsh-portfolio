/**
 * Site theme: Espresso (dark) for everyone by default, Paper (light) when the visitor picks it.
 * The choice is remembered. index.html applies it before the first paint, so there is no flash.
 */

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'portfolio-theme';
// Matches --bg for each theme, for the browser's address bar colour on phones.
const BAR_COLOR: Record<Theme, string> = { dark: '#110f0d', light: '#f6f4ee' };

const listeners = new Set<() => void>();

export const getTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'
    ? 'light'
    : 'dark';

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR_COLOR[theme]);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the theme still applies for this page view.
  }
  listeners.forEach((l) => l());
}

type ViewTransitionDocument = Document & { startViewTransition?: (update: () => void) => unknown };

/**
 * Switches the theme with a short cross-fade where the browser supports view transitions
 * (recent Chrome, Safari 18+), and instantly elsewhere or under reduced motion.
 */
export function setTheme(theme: Theme) {
  if (theme === getTheme()) return;
  const doc = document as ViewTransitionDocument;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || reduce) {
    apply(theme);
    return;
  }
  doc.startViewTransition(() => apply(theme));
}

export const toggleTheme = () => setTheme(getTheme() === 'dark' ? 'light' : 'dark');
