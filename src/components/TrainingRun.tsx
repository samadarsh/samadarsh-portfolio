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
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function drawChart(canvas: HTMLCanvasElement, step: number) {
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

  const css = getComputedStyle(document.documentElement);
  const hsl = (name: string, a = 1) => `hsl(${css.getPropertyValue(name).trim()} / ${a})`;
  const up = `rgb(${css.getPropertyValue('--up').trim()})`;

  const left = 30;
  const X = (s: number) => left + ((w - left - 10) * s) / STEPS;
  const Y = (l: number) => 8 + (h - 24) * (1 - (l - 0.1) / 2.55);

  ctx.strokeStyle = hsl('--text', 0.06);
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 8 + ((h - 24) * i) / 4;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(w - 10, y);
    ctx.stroke();
  }
  ctx.fillStyle = hsl('--muted', 0.8);
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
  ctx.strokeStyle = hsl('--text', 0.08);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  line(step, 4);
  ctx.strokeStyle = hsl('--accent');
  ctx.lineWidth = 2.2;
  ctx.stroke();

  for (const c of checkpoints) {
    if (c.step > step) continue;
    ctx.fillStyle = c.final ? up : hsl('--text');
    ctx.beginPath();
    ctx.arc(X(c.step), Y(loss(c.step)), 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function TrainingRun() {
  const listRef = useRef<HTMLOListElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    const render = () => {
      drawChart(canvas, step);
      if (stepRef.current) stepRef.current.textContent = String(Math.round(step));
      if (lossRef.current) lossRef.current.textContent = loss(step).toFixed(3);
    };

    const update = () => {
      raf = 0;
      if (!still) {
        // Progress through the list: starts as it reaches the middle of the screen, ends as the
        // last checkpoint does.
        const r = list.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.max(0, Math.min(1, (vh * 0.6 - r.top) / Math.max(1, r.height - vh * 0.35)));
        step = p * STEPS;
        let last = 0;
        checkpoints.forEach((c, i) => {
          if (c.step <= step + 1) last = i;
        });
        setReached(last);
      }
      render();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    const unsubscribeTheme = subscribeTheme(schedule);
    const unsubscribeArcade = subscribeArcade(schedule);
    document.fonts.ready.then(schedule);
    schedule();

    return () => {
      window.removeEventListener('scroll', schedule);
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
        subtitle="Scroll to run it. Every checkpoint is a real step: a degree, research papers, trading desks, an AI team."
      />

      <div className="grid grid-cols-1 border-t border-white/[0.06] md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        {/* Pinned chart: below the navbar on phones, beside the story on wider screens. */}
        <div
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
