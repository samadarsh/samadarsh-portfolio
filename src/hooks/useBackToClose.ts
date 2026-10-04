import { useEffect, useRef } from 'react';

/**
 * On phones, the system back button (or back swipe) closes an open sheet instead of leaving
 * the page. Each open overlay adds one history entry with the same URL; going back closes the
 * topmost overlay. Closing an overlay any other way removes that entry again.
 */

const PHONE_QUERY = '(max-width: 767px)';
const stack: (() => void)[] = [];
let entryActive = false;

const hasOurEntry = () => (window.history.state as { overlay?: boolean } | null)?.overlay === true;

function onPopState() {
  if (entryActive) {
    entryActive = false;
    stack[stack.length - 1]?.();
  } else if (stack.length === 0 && hasOurEntry()) {
    // Landed on an entry left behind by navigating away from inside an overlay: skip it.
    window.history.back();
  }
}

if (typeof window !== 'undefined') window.addEventListener('popstate', onPopState);

function register(close: () => void) {
  stack.push(close);
  if (!entryActive) {
    // Keep React Router's own state (index, key) so it treats this as the same location.
    window.history.pushState({ ...(window.history.state as object | null), overlay: true }, '');
    entryActive = true;
  }
}

function unregister(close: () => void) {
  const i = stack.lastIndexOf(close);
  if (i !== -1) stack.splice(i, 1);
  // Deferred so an overlay that opens another (search → chat) hands over the entry instead
  // of popping it, and so a navigation from inside the overlay keeps its new page. Search runs
  // its command a tick after closing, so this waits a little longer than that.
  window.setTimeout(() => {
    if (stack.length > 0) return;
    if (entryActive && hasOurEntry()) window.history.back();
    entryActive = false;
  }, 150);
}

export function useBackToClose(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open || !window.matchMedia(PHONE_QUERY).matches) return;
    const handler = () => closeRef.current();
    register(handler);
    return () => unregister(handler);
  }, [open]);
}
