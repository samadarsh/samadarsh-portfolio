import { isSoundOn } from './sound';
import { getTheme } from './theme';

/**
 * Arcade mode, the Konami code's reward: the whole site turns into an 1980s arcade cabinet (pixel
 * fonts, neon colours, scanlines) while everything keeps working. It lasts for this browser tab,
 * across pages and reloads. The pixel fonts load only when it is first switched on. index.html
 * applies a saved session before the first paint, so a reload doesn't flash the normal theme.
 */

const STORAGE_KEY = 'portfolio-arcade';
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Pixelify+Sans:wght@400..700&family=VT323&display=swap';
const BAR_COLOR = '#0b0614';
const THEME_BAR: Record<'dark' | 'light', string> = { dark: '#110f0d', light: '#f6f4ee' };

const listeners = new Set<() => void>();

export const isArcade = () =>
  typeof document !== 'undefined' && 'arcade' in document.documentElement.dataset;

export function subscribeArcade(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function loadFonts() {
  if (document.querySelector('link[data-arcade-fonts]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONT_URL;
  link.dataset.arcadeFonts = '';
  document.head.appendChild(link);
}

/** A four-note coin jingle, only when the visitor has turned sound on. */
function jingle() {
  if (!isSoundOn() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    const ctx = new AudioContext();
    [523, 659, 784, 1046].forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    });
    window.setTimeout(() => ctx.close(), 800);
  } catch {
    // Audio unavailable; stay silent.
  }
}

export function setArcade(on: boolean) {
  if (on === isArcade()) return;
  const root = document.documentElement;
  if (on) {
    loadFonts();
    root.dataset.arcade = '';
    jingle();
  } else {
    delete root.dataset.arcade;
  }
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', on ? BAR_COLOR : THEME_BAR[getTheme()]);
  try {
    if (on) sessionStorage.setItem(STORAGE_KEY, '1');
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked: arcade mode still applies for this page view.
  }
  listeners.forEach((l) => l());
}

export const toggleArcade = () => setArcade(!isArcade());
