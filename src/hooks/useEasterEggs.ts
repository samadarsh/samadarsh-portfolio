import { useEffect } from 'react';
import { useGoTo } from './useGoTo';
import { unlock } from '../lib/achievements';

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

/** Konami code and typing "hire" anywhere on the page. */
export function useEasterEggs() {
  const goTo = useGoTo();

  useEffect(() => {
    let keys: string[] = [];
    let typed = '';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(document.activeElement)) return;
      const key = e.key.toLowerCase();

      keys = [...keys, key].slice(-KONAMI.length);
      if (keys.join() === KONAMI.join()) {
        keys = [];
        burst();
        unlock('konami');
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

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [goTo]);
}
