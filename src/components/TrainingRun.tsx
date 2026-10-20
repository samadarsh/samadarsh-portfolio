import { useEffect, useRef, useState } from 'react';
import { checkpoints, loss } from '../data/trainingRun';
import { contact } from '../data/content';
import { unlock } from '../lib/achievements';
import { subscribeTheme } from '../lib/theme';
import { subscribeArcade } from '../lib/arcade';
import { SectionHeader } from './SectionHeader';

/**
 * Career as a training run. As the visitor scrolls the checkpoints, the loss curve draws itself in
 * a pinned chart (beside the story on desktop, at the top on phones) and each milestone lights up,
 * ending in "converged". Every checkpoint's text, including each role's details, is ordinary
 * content on the page; the chart is decoration. Reduced motion shows the finished run.
 */

const STEPS = 1000;
/** Height of the floating navbar, which covers the top of the screen on wide layouts. */
const NAV_CLEARANCE = 96;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Palette = { text: string; muted: string; accent: string; up: string };

/** The theme's colours, read once per theme change rather than on every frame. */
function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return { text: v('--text'), muted: v('--muted'), accent: v('--accent'), up: `rgb(${v('--up')})` };
}

function drawChart(canvas: HTMLCanvasElement, step: number, colors: Palette) {
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!ctx || !w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const hsl = (name: 'text' | 'muted' | 'accent', a = 1) => `hsl(${colors[name]} / ${a})`;
  const up = colors.up;

  const left = 30;
  const X = (s: number) => left + ((w - left - 10) * s) / STEPS;
  const Y = (l: number) => 8 + (h - 24) * (1 - (l - 0.1) / 2.55);

  ctx.strokeStyle = hsl('text', 0.06);
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 8 + ((h - 24) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(w - 10, y);
    ctx.stroke();
  }
  ctx.fillStyle = hsl('muted', 0.8);
  ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('loss', 0, 14);
  ctx.fillText('step', w - 34, h - 2);

  const line = (to: number, every: number) => {
    ctx.beginPath();
    for (let s = 0; s <= to; s += every) {
      if (s) ctx.lineTo(X(s), Y(loss(s)));
      else ctx.moveTo(X(s), Y(loss(s)));
    }
  };
  // The full run, faint, so the shape is visible from the start.
  line(STEPS, 5);
  ctx.strokeStyle = hsl('text', 0.08);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  line(step, 4);
  ctx.strokeStyle = hsl('accent');
  ctx.lineWidth = 2.2;
  ctx.stroke();

  for (const c of checkpoints) {
    if (c.step > step) continue;
    ctx.fillStyle = c.final ? up : hsl('text');
    ctx.beginPath();
    ctx.arc(X(c.step), Y(loss(c.step)), 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function TrainingRun() {
  const listRef = useRef<HTMLOListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLElement>(null);
  const lossRef = useRef<HTMLElement>(null);
  const [reached, setReached] = useState(() => (reduceMotion() ? checkpoints.length - 1 : 0));
  const converged = reached === checkpoints.length - 1;

  useEffect(() => {
    const list = listRef.current;
    const canvas = canvasRef.current;
    if (!list || !canvas) return;
    const still = reduceMotion();
    let step = still ? STEPS : 0;
    let raf = 0;
    let colors = readPalette();
    // What's on the canvas now; a frame that would draw the same picture is skipped.
    let drawn = '';
    // The run only follows the scroll while the section is near the screen.
    let near = false;

    const render = () => {
      const key = `${step.toFixed(1)} ${canvas.clientWidth}x${canvas.clientHeight}`;
      if (key === drawn) return;
      drawn = key;
      drawChart(canvas, step, colors);
      if (stepRef.current) stepRef.current.textContent = String(Math.round(step));
      if (lossRef.current) lossRef.current.textContent = loss(step).toFixed(3);
    };

    const update = () => {
      raf = 0;
      if (!still && near) {
        // A checkpoint lights up as its top crosses the middle of the part of the screen the
        // visitor can read: below the pinned chart on phones, below the navbar beside it. The
        // chart's step then moves from one checkpoint's step to the next as the following one
        // approaches, so the curve and the story always agree.
        const pin = pinRef.current?.getBoundingClientRect();
        const box = list.getBoundingClientRect();
        const stacked = pin && pin.left < box.right && box.left < pin.right;
        const readTop = stacked ? pin.bottom : NAV_CLEARANCE;
        const line = readTop + (window.innerHeight - readTop) * 0.5;
        const tops = [...list.children].map((li) => li.getBoundingClientRect().top);
        let last = -1;
        tops.forEach((top, i) => {
          if (top <= line) last = i;
        });
        if (last < 0) step = 0;
        else if (last === tops.length - 1) step = STEPS;
        else {
          const f = Math.max(0, Math.min(1, (line - tops[last]) / Math.max(1, tops[last + 1] - tops[last])));
          step = checkpoints[last].step + f * (checkpoints[last + 1].step - checkpoints[last].step);
        }
        setReached(Math.max(0, last));
      }
      render();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const redraw = () => {
      colors = readPalette();
      drawn = '';
      schedule();
    };
    const onScroll = () => {
      if (near) schedule();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        schedule();
      },
      { rootMargin: '50% 0px' },
    );
    io.observe(list.parentElement ?? list);
    window.addEventListener('scroll', onScroll, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    const unsubscribeTheme = subscribeTheme(redraw);
    const unsubscribeArcade = subscribeArcade(redraw);
    document.fonts.ready.then(redraw);
    schedule();

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      resize.disconnect();
      unsubscribeTheme();
      unsubscribeArcade();
      cancelAnimationFrame(raf);
    };
  }, []);

  // Finishing the run unlocks the "Background check" achievement.
  useEffect(() => {
    if (converged) unlock('background');
  }, [converged]);

  return (
    <div>
      <SectionHeader
        kicker="Experience"
        title="Six years of training,"
        italic="one model."
        subtitle="Scroll to run it. Every checkpoint is a real step: a degree, research papers, red-teaming frontier models, an AI team."
      />

      <div className="grid grid-cols-1 border-t border-white/[0.06] md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* Pinned chart: below the navbar on phones, beside the story on wider screens. */}
        <div
          ref={pinRef}
          aria-hidden
          className="sticky top-[calc(max(1.25rem,env(safe-area-inset-top))+3.9rem)] z-10 -mx-6 self-start bg-bg px-6 pb-3 pt-3 md:top-28 md:mx-0 md:bg-transparent md:px-0 md:pt-8"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 md:p-4">
            <div className="flex justify-between font-mono text-[11px] text-muted">
              <span>run: adarsh-s</span>
              <span>
                step{' '}
                <b ref={stepRef} className="font-normal text-accent">
                  0
                </b>{' '}
                · loss{' '}
                <b ref={lossRef} className="font-normal text-accent">
                  {loss(0).toFixed(3)}
                </b>
              </span>
            </div>
            <canvas
              ref={canvasRef}
              className="mt-2 block h-[108px] w-full min-[380px]:h-[132px] md:h-[280px]"
            />
            <p className="mt-2 font-mono text-[11px] text-muted md:text-xs">
              status:{' '}
              {converged ? (
                <span className="text-[rgb(var(--up))]">converged ✓ ready for deployment</span>
              ) : (
                'training…'
              )}
            </p>
          </div>
        </div>

        <ol ref={listRef} className="min-w-0">
          {checkpoints.map((c, i) => (
            <li
              key={c.title}
              className={`border-b border-dashed border-white/[0.08] py-8 transition-opacity duration-500 focus-within:opacity-100 motion-reduce:transition-none md:min-h-[260px] md:py-10 ${
                i <= reached ? 'opacity-100' : 'opacity-40'
              } ${c.final ? 'border-b-0' : ''}`}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                {c.label}
              </p>
              <h3
                className={`mt-2 font-display text-2xl leading-tight tracking-tight md:text-3xl ${
                  c.final ? 'text-[rgb(var(--up))]' : 'text-text-primary'
                }`}
              >
                {c.title}
              </h3>
              {c.role ? <p className="mt-1 text-sm font-medium text-accent">{c.role}</p> : null}
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{c.body}</p>
              {c.points ? (
                <details className="group mt-3">
                  <summary className="inline-flex min-h-[40px] cursor-pointer list-none items-center gap-2 text-sm text-text-primary [&::-webkit-details-marker]:hidden">
                    <span className="border-b border-accent/40 pb-0.5">What I did</span>
                    <span
                      aria-hidden
                      className="text-muted transition-transform group-open:rotate-180"
                    >
                      ↓
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-2 text-sm text-muted">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5">
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted/60" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {c.final ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-sm text-text-primary"
                >
                  <span className="border-b border-accent/40 pb-0.5">{contact.email}</span>
                  <span aria-hidden>→</span>
                </a>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
