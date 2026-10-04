import Lenis from 'lenis';

let lenis: Lenis | null = null;

export const getLenis = () => lenis;

/** Starts Lenis smooth scrolling unless the visitor prefers reduced motion. Returns a cleanup. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

/**
 * An element's distance from the top of the document, ignoring CSS transforms. Sections
 * slide up as they enter the viewport, so the on-screen box can be offset mid-animation.
 */
function layoutTop(el: HTMLElement) {
  let top = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null)
    top += node.offsetTop;
  return top;
}

/**
 * Scrolls an element to the top of the viewport, honouring its CSS scroll-margin-top.
 * Instant jumps (e.g. after a route change) use native scrolling: Lenis may still hold the
 * previous page's position at that moment, and it re-syncs from the native scroll event.
 */
export function scrollToElement(el: HTMLElement, { immediate = false } = {}) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  const top = Math.max(0, layoutTop(el) - margin);
  if (lenis && !immediate) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
}

/** Pauses smooth scrolling (e.g. while a modal is open). */
export function lockScroll() {
  lenis?.stop();
  const { overflow } = document.documentElement.style;
  document.documentElement.style.overflow = 'hidden';
  return () => {
    document.documentElement.style.overflow = overflow;
    lenis?.start();
  };
}
