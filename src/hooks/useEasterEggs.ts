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
const SWIPES = KONAMI.slice(0, 8);
const SWIPE_MIN = 40; // px
const SWIPE_GAP = 2500; // ms allowed between swipes
const EDGE = 24; // px; swipes from the screen edge are the browser's back/forward gesture

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

    let swipes: string[] = [];
    let last = 0;
    let start: { x: number; y: number; t: number } | null = null;
    let end = { x: 0, y: 0 };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start =
        e.touches.length === 1 && t.clientX > EDGE && t.clientX < window.innerWidth - EDGE
          ? { x: t.clientX, y: t.clientY, t: e.timeStamp }
          : null;
      end = { x: t.clientX, y: t.clientY };
    };
    const onTouchMove = (e: TouchEvent) => {
      end = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    // Some browsers cancel the touch once the page starts scrolling, so a cancel counts as the end
    // of the swipe too, using the last position seen.
    const onTouchEnd = (e: TouchEvent) => {
      if (!start || isTypingTarget(document.activeElement)) return;
      const t = e.changedTouches[0];
      const x = e.type === 'touchend' && t ? t.clientX : end.x;
      const y = e.type === 'touchend' && t ? t.clientY : end.y;
      const dx = x - start.x;
      const dy = y - start.y;
      const quick = e.timeStamp - start.t < 700;
      start = null;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      // Only clear, quick, straight swipes count.
      if (!quick || Math.max(ax, ay) < SWIPE_MIN || Math.min(ax, ay) > Math.max(ax, ay) / 2) return;
      // A finger moving up is "up", like the arrow key.
      const dir =
        ax > ay ? (dx > 0 ? 'arrowright' : 'arrowleft') : dy > 0 ? 'arrowdown' : 'arrowup';
      if (e.timeStamp - last > SWIPE_GAP) swipes = [];
      last = e.timeStamp;
      swipes = [...swipes, dir].slice(-SWIPES.length);
      if (swipes.join() === SWIPES.join()) {
        swipes = [];
        konami();
      }
    };

    const opts = { passive: true } as const;
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, opts);
    window.addEventListener('touchmove', onTouchMove, opts);
    window.addEventListener('touchend', onTouchEnd, opts);
    window.addEventListener('touchcancel', onTouchEnd, opts);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [goTo]);
}
