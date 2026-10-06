import { useEffect } from 'react';
import { useGoTo } from './useGoTo';
import { unlock } from '../lib/achievements';
import { isArcade, setArcade, toggleArcade } from '../lib/arcade';

const KONAMI = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];
const HIRE = 'hire';
// Phones have no arrow keys: the code is the eight arrows as swipes (B and A are left out, since a
// tap would also press whatever is under the finger).
// Thumb swipes are often slow and curved, so the rules are loose: the code needs four sideways
// swipes in a row, which ordinary scrolling never produces.
const SWIPES = KONAMI.slice(0, 8);
const SWIPE_MIN = 30; // px
const SWIPE_MAX_MS = 1500; // a longer press-and-drag isn't a swipe
const SWIPE_GAP = 5000; // ms allowed between swipes
const EDGE = 20; // px; swipes from the screen edge are the browser's back/forward gesture
const ARROW: Record<string, string> = {
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
};

/**
 * Once a visitor is clearly entering the code (the first sideways swipe), a small row of arrows
 * shows how far they've got, so a swipe that didn't count is obvious.
 */
let progressEl: HTMLElement | null = null;
let progressTimer = 0;
function showProgress(done: number) {
  window.clearTimeout(progressTimer);
  if (done < 5) {
    progressEl?.remove();
    progressEl = null;
    return;
  }
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.className = 'konami-progress';
    progressEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressEl);
  }
  progressEl.innerHTML = SWIPES.map(
    (k, i) => `<span${i < done ? ' class="on"' : ''}>${ARROW[k]}</span>`,
  ).join('');
  progressTimer = window.setTimeout(
    () => showProgress(0),
    done === SWIPES.length ? 900 : SWIPE_GAP,
  );
}

// Any open panel (terminal, Ash, search, achievements) gets Esc first.
const dialogOpen = () => !!document.querySelector('[role="dialog"]');

const isTypingTarget = (el: Element | null) =>
  !!el &&
  (el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    (el as HTMLElement).isContentEditable);

function burst() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 36; i++) {
    const s = document.createElement('span');
    s.className = 'konami-burst';
    s.textContent = '✦';
    s.setAttribute('aria-hidden', 'true');
    const angle = Math.random() * Math.PI * 2;
    const distance = 140 + Math.random() * 260;
    s.style.left = `${window.innerWidth / 2}px`;
    s.style.top = `${window.innerHeight / 2}px`;
    s.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    s.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
    s.style.setProperty('--r', `${Math.random() * 360}deg`);
    document.body.appendChild(s);
    window.setTimeout(() => s.remove(), 1700);
  }
}

function konami() {
  burst();
  unlock('konami');
  toggleArcade();
}

/** Konami code (arcade mode), its swipe version on phones, and typing "hire" anywhere. */
export function useEasterEggs() {
  const goTo = useGoTo();

  useEffect(() => {
    let keys: string[] = [];
    let typed = '';

    const onKeyDown = (e: KeyboardEvent) => {
      // Esc leaves arcade mode, unless it is closing a panel.
      if (e.key === 'Escape' && isArcade() && !dialogOpen()) setArcade(false);

      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(document.activeElement)) return;
      const key = e.key.toLowerCase();

      keys = [...keys, key].slice(-KONAMI.length);
      if (keys.join() === KONAMI.join()) {
        keys = [];
        konami();
      }

      if (key.length === 1) {
        typed = (typed + key).slice(-HIRE.length);
        if (typed === HIRE) {
          typed = '';
          unlock('hire');
          goTo(window.location.pathname, 'contact');
        }
      }
    };

    let done = 0; // swipes of the code matched so far
    let last = 0;
    let start: { x: number; y: number; t: number } | null = null;
    let end = { x: 0, y: 0 };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      start =
        e.touches.length === 1 && t.clientX > EDGE && t.clientX < window.innerWidth - EDGE
          ? { x: t.clientX, y: t.clientY, t: performance.now() }
          : null;
      end = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) end = { x: t.clientX, y: t.clientY };
    };
    // Some browsers cancel the touch once the page starts scrolling, so a cancel counts as the end
    // of the swipe too, using the last position seen.
    const onTouchEnd = (e: TouchEvent) => {
      if (!start || isTypingTarget(document.activeElement)) return;
      const t = e.type === 'touchend' ? e.changedTouches[0] : undefined;
      const dx = (t ? t.clientX : end.x) - start.x;
      const dy = (t ? t.clientY : end.y) - start.y;
      const now = performance.now();
      const tooSlow = now - start.t > SWIPE_MAX_MS;
      start = null;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      // A tap, a long drag, or a near-diagonal swipe doesn't count (and doesn't reset either).
      if (tooSlow || Math.max(ax, ay) < SWIPE_MIN || Math.min(ax, ay) > Math.max(ax, ay) * 0.8)
        return;
      // A finger moving up is "up", like the arrow key.
      const dir =
        ax > ay ? (dx > 0 ? 'arrowright' : 'arrowleft') : dy > 0 ? 'arrowdown' : 'arrowup';
      if (now - last > SWIPE_GAP) done = 0;
      last = now;
      if (dir === SWIPES[done]) done += 1;
      // A wrong swipe can still be the start of a fresh attempt (e.g. a third "up").
      else done = dir === SWIPES[0] ? (done === 2 && dir === 'arrowup' ? 2 : 1) : 0;
      showProgress(done);
      if (done === SWIPES.length) {
        done = 0;
        konami();
      }
    };

    // Capture phase, so nothing on the page can stop the swipe from being seen.
    const opts = { passive: true, capture: true } as const;
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, opts);
    window.addEventListener('touchmove', onTouchMove, opts);
    window.addEventListener('touchend', onTouchEnd, opts);
    window.addEventListener('touchcancel', onTouchEnd, opts);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart, opts);
      window.removeEventListener('touchmove', onTouchMove, opts);
      window.removeEventListener('touchend', onTouchEnd, opts);
      window.removeEventListener('touchcancel', onTouchEnd, opts);
      showProgress(0);
    };
  }, [goTo]);
}
