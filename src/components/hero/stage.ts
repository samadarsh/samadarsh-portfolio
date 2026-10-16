import type { HeroProof } from '../../data/heroProofs';

/** Shared plumbing for the two home-hero canvases (ink reveal on Paper, pixel lens on Espresso). */

export type Stage = { ctx: CanvasRenderingContext2D; W: number; H: number; dpr: number };

export type HeroEngine = (
  host: HTMLElement,
  canvas: HTMLCanvasElement,
  options: { proofs: HeroProof[]; reduced: boolean; onIntroDone: () => void },
) => () => void;

/** Sizes the canvas to its box at the device's pixel ratio (capped at 2) and returns the context. */
export function fitCanvas(canvas: HTMLCanvasElement): Stage | null {
  const ctx = canvas.getContext('2d');
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  if (!ctx || !W || !H) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H, dpr };
}

/** An offscreen layer the same size as the stage, drawn in CSS pixels. */
export function layer(s: Stage) {
  const c = document.createElement('canvas');
  c.width = Math.round(s.W * s.dpr);
  c.height = Math.round(s.H * s.dpr);
  const ctx = c.getContext('2d')!;
  ctx.setTransform(s.dpr, 0, 0, s.dpr, 0, 0);
  return { canvas: c, ctx };
}

/** A theme colour as a canvas fill, so Paper, Espresso and arcade mode all follow the tokens. */
export function token(name: '--bg' | '--text' | '--muted' | '--accent', alpha = 1) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return `hsl(${v} / ${alpha})`;
}

export const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

/** The largest font size (up to `max`) at which `text` fits in `width`. */
export function fitFont(ctx: CanvasRenderingContext2D, text: string, family: string, width: number, max: number) {
  let size = max;
  ctx.font = `${size}px ${family}`;
  while (ctx.measureText(text).width > width && size > 12) {
    size *= 0.96;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

const SAMPLE = 'ADARSH S 83.7%';

/** True once a face of the font's first family has actually loaded. */
function loaded(font: string) {
  const family = font.replace(/^.*?px\s+/, '').replace(/"/g, '');
  return [...document.fonts].some((f) => f.family.replace(/"/g, '') === family && f.status === 'loaded');
}

/**
 * Waits for the hero's display fonts so the first frame isn't drawn in a fallback face. The faces
 * are subset to the hero's characters (index.html), so the load asks for those characters. Safari
 * can run this before the font stylesheet has arrived, when a load finds nothing to fetch, so it
 * retries until the faces are really there (for up to six seconds).
 * `first` settles after 1.5 s at most, so a slow connection never holds the hero back; `all`
 * settles once the fonts are in, and the engine repaints then if it had to start without them.
 * Pass each font with its own family first, e.g. `100px Anton`.
 */
export function fontsReady(fonts: string[]) {
  if (!document.fonts?.load) return { first: Promise.resolve(), all: Promise.resolve() };
  const all = new Promise<void>((resolve) => {
    let tries = 0;
    const attempt = () =>
      Promise.all(fonts.map((f) => document.fonts.load(f, SAMPLE)))
        .catch(() => undefined)
        .then(() => {
          if (fonts.every(loaded) || ++tries >= 12) resolve();
          else setTimeout(attempt, 500);
        });
    attempt();
  });
  return { first: Promise.race([all, new Promise<void>((r) => setTimeout(r, 1500))]), all };
}

/** Runs `tick` every frame while `el` is on screen and the tab is visible. Returns a stop function. */
export function whileVisible(el: HTMLElement, tick: (now: number) => void) {
  let frame = 0;
  let onScreen = false;
  const loop = (now: number) => {
    tick(now);
    frame = requestAnimationFrame(loop);
  };
  const sync = () => {
    const run = onScreen && document.visibilityState === 'visible';
    if (run && !frame) frame = requestAnimationFrame(loop);
    if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  const io = new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    sync();
  });
  io.observe(el);
  document.addEventListener('visibilitychange', sync);
  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', sync);
    cancelAnimationFrame(frame);
  };
}

/**
 * The pointer over `el`, in `el`'s coordinates. `active` is false once it leaves, and while it is
 * over the hero's own text and buttons (anything marked `data-hero-ui`), so the effect stays clear
 * of what the visitor is about to read or click.
 */
export function trackPointer(el: HTMLElement) {
  const p = { x: 0, y: 0, active: false };
  const at = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    p.x = e.clientX - r.left;
    p.y = e.clientY - r.top;
    p.active = !(e.target as Element | null)?.closest('[data-hero-ui]');
  };
  const leave = () => {
    p.active = false;
  };
  el.addEventListener('pointermove', at);
  el.addEventListener('pointerdown', at);
  el.addEventListener('pointerleave', leave);
  el.addEventListener('pointercancel', leave);
  return {
    p,
    dispose: () => {
      el.removeEventListener('pointermove', at);
      el.removeEventListener('pointerdown', at);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointercancel', leave);
    },
  };
}
