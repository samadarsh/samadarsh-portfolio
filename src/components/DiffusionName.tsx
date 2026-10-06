import { useEffect, useLayoutEffect, useRef } from 'react';
import { whenIntroDone } from '../lib/intro';
import { markNameShown, resetNameShown } from '../lib/heroName';

/**
 * The hero name, generated the way diffusion models make images: it starts as scattered noise and
 * denoises onto the real letters, then hands over to the actual text. The points are sampled from
 * the name as the browser renders it (same font, size and spacing), so the hand-over is seamless.
 * Plays each time the home page shows; reduced motion shows the name straight away. The text is
 * in the page the whole time, so screen readers and search engines read it normally.
 */

const DURATION = 1900;
// Extra room around the name for the noise to start in.
const PAD = 16;

type Point = { x: number; y: number; nx: number; ny: number; warm: boolean };

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Rasterises each name line exactly where the page draws it and returns the inked pixels. */
function samplePoints(h1: HTMLElement, width: number, height: number, step: number): Point[] {
  const box = h1.getBoundingClientRect();
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.fillStyle = '#000';

  for (const line of h1.querySelectorAll<HTMLElement>('[data-line]')) {
    const css = getComputedStyle(line);
    const rect = line.getBoundingClientRect();
    const text = line.textContent ?? '';
    ctx.font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
    const metrics = ctx.measureText(text);
    const ascent = metrics.fontBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent;
    // Same baseline the browser uses: the font box is centred in the line box.
    const baseline = rect.top - box.top + PAD + (rect.height - (ascent + descent)) / 2 + ascent;
    const spacing = parseFloat(css.letterSpacing) || 0;
    const left = rect.left - box.left + PAD;
    // Drawn letter by letter so the site's tight letter-spacing is matched in every browser.
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], left + ctx.measureText(text.slice(0, i)).width + i * spacing, baseline);
    }
  }

  const data = ctx.getImageData(0, 0, width, height).data;
  const points: Point[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 140) {
        points.push({
          x,
          y,
          nx: Math.random() * width,
          ny: Math.random() * height,
          warm: Math.random() < 0.5,
        });
      }
    }
  }
  return points;
}

export function DiffusionName({ className = '' }: { className?: string }) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hide the letters before the first paint, so the name never flashes before the noise.
  useLayoutEffect(() => {
    resetNameShown();
    if (h1Ref.current && !reduceMotion()) h1Ref.current.dataset.diffusing = '';
  }, []);

  useEffect(() => {
    const h1 = h1Ref.current;
    const canvas = canvasRef.current;
    if (!h1 || !canvas) return;
    if (reduceMotion()) {
      markNameShown();
      return;
    }

    let raf = 0;
    let cancelled = false;
    const reveal = () => {
      delete h1.dataset.diffusing;
      canvas.style.opacity = '0';
      markNameShown();
    };
    // Any failure (or a very slow font) shows the plain name.
    const safety = window.setTimeout(reveal, 6000);

    const start = () => {
      if (cancelled) return;
      const box = h1.getBoundingClientRect();
      const width = Math.ceil(box.width + PAD * 2);
      const height = Math.ceil(box.height + PAD * 2);
      const step = width < 520 ? 2 : 3;
      const points = samplePoints(h1, width, height, step);
      const ctx = canvas.getContext('2d');
      if (!points.length || !ctx) return reveal();

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.opacity = '1';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Theme colours: the name's own colour, plus the accent for the warm half of the noise.
      const ink = getComputedStyle(document.documentElement);
      const text = `hsl(${ink.getPropertyValue('--text').trim()}`;
      const accent = `hsl(${ink.getPropertyValue('--accent').trim()}`;
      const dot = step * 0.85;
      const t0 = performance.now();

      const frame = (now: number) => {
        const progress = Math.min(1, (now - t0) / DURATION);
        // Noise level falls fast at first, then settles gently onto the letters.
        const sigma = Math.pow(1 - progress, 2.4);
        const jitter = 28 * sigma;
        const alpha = (0.3 + (1 - sigma) * 0.65).toFixed(2);
        ctx.clearRect(0, 0, width, height);
        for (const p of points) {
          const x = p.x + (p.nx - p.x) * sigma + (Math.random() - 0.5) * jitter;
          const y = p.y + (p.ny - p.y) * sigma + (Math.random() - 0.5) * jitter;
          ctx.fillStyle = sigma > 0.03 ? `${p.warm ? accent : text} / ${alpha})` : `${text} / 1)`;
          ctx.fillRect(x, y, dot, dot);
        }
        if (progress < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          window.clearTimeout(safety);
          reveal();
        }
      };
      raf = requestAnimationFrame(frame);
    };

    // Wait for the real font (the points must match it) and for the intro loader to leave.
    const cancelIntro = whenIntroDone(() => {
      document.fonts.ready.then(() => requestAnimationFrame(start));
    });

    return () => {
      cancelled = true;
      cancelIntro();
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
      delete h1.dataset.diffusing;
    };
  }, []);

  return (
    <div className="relative">
      <h1 ref={h1Ref} className={className}>
        <span className="name-reveal" data-line>
          Adarsh
        </span>
        <span className="name-reveal italic text-text-primary/90" data-line>
          S.
        </span>
      </h1>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute opacity-0 transition-opacity duration-300"
        style={{ left: -PAD, top: -PAD }}
      />
    </div>
  );
}
