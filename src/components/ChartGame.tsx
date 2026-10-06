import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { unlock } from '../lib/achievements';
import { playSound } from '../lib/sound';
import { useTheme } from '../hooks/useTheme';

type Candle = [date: string, open: number, high: number, low: number, close: number];
type Dataset = { symbol: string; source: string; updated: string; candles: Candle[] };
type Round = { start: number; revealed: boolean; guess?: 'up' | 'down' };
type Status = 'loading' | 'ready' | 'error';

const SHOWN = 40;
const HIDDEN = 10;
const BEST_KEY = 'portfolio-chart-best';

const dataUrl = `${import.meta.env.BASE_URL}data/nifty50.json`;

const inr = (v: number) => Math.round(v).toLocaleString('en-IN');
const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const cssVar = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function drawChart(canvas: HTMLCanvasElement, candles: Candle[], visible: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const W = rect.width;
  const H = rect.height;
  const narrow = W < 500;
  const pad = { l: 10, r: narrow ? 56 : 68, t: 18, b: 14 };
  const accent = cssVar('--accent');
  const muted = cssVar('--muted');
  const text = cssVar('--text');
  const up = `rgb(${cssVar('--up')})`;
  const down = `rgb(${cssVar('--down')})`;

  // Scale to the candles on screen only; including the hidden ones would leak the answer.
  const shown = candles.slice(0, visible);
  const rawHi = Math.max(...shown.map((c) => c[2]));
  const rawLo = Math.min(...shown.map((c) => c[3]));
  const headroom = (rawHi - rawLo) * 0.08;
  const hi = rawHi + headroom;
  const lo = rawLo - headroom;
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo || 1)) * (H - pad.t - pad.b);
  const step = (W - pad.l - pad.r) / candles.length;
  const body = Math.max(2, step * 0.62);

  ctx.clearRect(0, 0, W, H);
  ctx.font = `${narrow ? 10 : 11}px "JetBrains Mono", ui-monospace, monospace`;

  // Price grid
  for (let g = 0; g <= 4; g++) {
    const v = lo + ((hi - lo) * g) / 4;
    const gy = y(v);
    ctx.strokeStyle = `rgb(${cssVar('--ink')} / 0.06)`;
    ctx.beginPath();
    ctx.moveTo(pad.l, gy);
    ctx.lineTo(W - pad.r + 6, gy);
    ctx.stroke();
    ctx.fillStyle = `hsl(${muted})`;
    ctx.fillText(inr(v), W - pad.r + 10, gy + 4);
  }

  // Hidden zone
  const cut = pad.l + SHOWN * step;
  ctx.fillStyle = `hsl(${accent} / 0.05)`;
  ctx.fillRect(cut, pad.t - 8, W - pad.r - cut, H - pad.t - pad.b + 16);
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = `hsl(${accent} / 0.5)`;
  ctx.beginPath();
  ctx.moveTo(cut, pad.t - 8);
  ctx.lineTo(cut, H - pad.b + 8);
  ctx.stroke();
  ctx.setLineDash([]);
  if (visible <= SHOWN) {
    ctx.fillStyle = `hsl(${accent})`;
    ctx.fillText('?', cut + (W - pad.r - cut) / 2 - 3, (H - pad.b + pad.t) / 2);
  }

  // Candles
  for (let i = 0; i < visible; i++) {
    const [, o, h, l, c] = candles[i];
    const x = pad.l + i * step + step / 2;
    const color = c >= o ? up : down;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y(h));
    ctx.lineTo(x, y(l));
    ctx.stroke();
    ctx.fillRect(x - body / 2, y(Math.max(o, c)), body, Math.max(1, Math.abs(y(o) - y(c))));
  }

  // Last visible close marker
  const last = candles[SHOWN - 1][4];
  const ly = y(last);
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = `hsl(${text} / 0.35)`;
  ctx.beginPath();
  ctx.moveTo(pad.l, ly);
  ctx.lineTo(W - pad.r + 6, ly);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = `hsl(${text})`;
  ctx.fillRect(W - pad.r + 6, ly - 9, pad.r - 8, 18);
  ctx.fillStyle = `hsl(${cssVar('--bg')})`;
  ctx.fillText(inr(last), W - pad.r + 10, ly + 4);
}

/**
 * "Read the chart": 40 real Nifty 50 sessions are shown; guess whether the close is higher
 * or lower 10 sessions later, then the hidden candles and the real dates are revealed.
 */
export function ChartGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [data, setData] = useState<Dataset | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [visible, setVisible] = useState(SHOWN);
  const [score, setScore] = useState({ right: 0, played: 0, streak: 0, best: readBest() });

  useEffect(() => {
    let cancelled = false;
    fetch(dataUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: Dataset) => {
        if (cancelled) return;
        if (!Array.isArray(d.candles) || d.candles.length < SHOWN + HIDDEN)
          throw new Error('empty');
        setData(d);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  const newRound = useCallback(() => {
    if (!data) return;
    const max = data.candles.length - SHOWN - HIDDEN;
    setRound({ start: Math.floor(Math.random() * max), revealed: false });
    setVisible(SHOWN);
  }, [data]);

  useEffect(() => {
    if (data && !round) newRound();
  }, [data, round, newRound]);

  // Keyed on the start index only, so guessing (which updates `round`) doesn't re-slice.
  const start = round?.start;
  const window_ = useMemo(
    () => (data && start !== undefined ? data.candles.slice(start, start + SHOWN + HIDDEN) : null),
    [data, start],
  );

  // Draw on every change, whenever the canvas resizes, and when the theme changes its colours.
  const theme = useTheme();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !window_) return;
    const draw = () => drawChart(canvas, window_, visible);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [window_, visible, theme]);

  const guess = (choice: 'up' | 'down') => {
    if (!round || round.guess || !window_) return;
    unlock('chart');
    setRound({ ...round, guess: choice });

    const finish = () => {
      const startClose = window_[SHOWN - 1][4];
      const endClose = window_[SHOWN + HIDDEN - 1][4];
      const correct = (endClose >= startClose ? 'up' : 'down') === choice;
      playSound(correct ? 'success' : 'tick');
      setScore((s) => {
        const streak = correct ? s.streak + 1 : 0;
        const best = Math.max(s.best, streak);
        try {
          localStorage.setItem(BEST_KEY, String(best));
        } catch {
          // ignore
        }
        if (streak >= 3) unlock('streak');
        return { right: s.right + (correct ? 1 : 0), played: s.played + 1, streak, best };
      });
      setRound((r) => (r ? { ...r, revealed: true } : r));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(SHOWN + HIDDEN);
      finish();
      return;
    }
    let shown = SHOWN;
    const tick = () => {
      shown += 1;
      setVisible(shown);
      if (shown < SHOWN + HIDDEN) window.setTimeout(tick, 90);
      else finish();
    };
    tick();
  };

  const result = (() => {
    if (!round?.revealed || !window_) return null;
    const startClose = window_[SHOWN - 1][4];
    const endClose = window_[SHOWN + HIDDEN - 1][4];
    const pct = ((endClose - startClose) / startClose) * 100;
    const correct = (endClose >= startClose ? 'up' : 'down') === round.guess;
    return {
      correct,
      pct,
      from: fmtDate(window_[0][0]),
      to: fmtDate(window_[SHOWN + HIDDEN - 1][0]),
    };
  })();

  return (
    <section
      id="chart-game"
      aria-labelledby="chart-game-title"
      className="scroll-mt-24 rounded-3xl border border-white/[0.08] bg-surface/40 p-4 sm:p-6 md:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
            Mini-game · Nifty 50
          </p>
          <h3
            id="chart-game-title"
            className="mt-2 font-display text-3xl tracking-tight text-text-primary md:text-4xl"
          >
            Read the chart
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            40 real trading sessions, dates hidden. Will the close be higher or lower 10 sessions
            later?
          </p>
        </div>
        <dl className="flex gap-6 font-mono tabular-nums">
          {[
            ['Correct', `${score.right}/${score.played}`],
            ['Streak', score.streak],
            ['Best', score.best],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="mt-1.5 text-xs uppercase tracking-[0.18em] text-muted md:text-[11px]">
                {label}
              </dt>
              <dd className="font-display text-3xl leading-none text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mt-5 h-[260px] overflow-hidden rounded-2xl border border-white/[0.06] bg-bg sm:h-[320px]">
        {status === 'ready' ? (
          <canvas
            ref={canvasRef}
            className="h-full w-full"
            role="img"
            aria-label={
              result
                ? `Nifty 50 from ${result.from} to ${result.to}; price moved ${result.pct.toFixed(2)}% over the last 10 sessions.`
                : 'Nifty 50 candlestick chart of 40 sessions with the next 10 hidden.'
            }
          />
        ) : (
          <p className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">
            {status === 'loading'
              ? 'Loading market data…'
              : 'Market data is unavailable right now.'}
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={() => guess('up')}
          disabled={!round || !!round.guess}
          className="min-h-[48px] rounded-xl border border-white/[0.1] px-5 text-sm font-medium text-[rgb(var(--up))] transition-colors enabled:hover:border-[rgb(var(--up))] disabled:opacity-40"
        >
          ▲ Higher
        </button>
        <button
          type="button"
          onClick={() => guess('down')}
          disabled={!round || !!round.guess}
          className="min-h-[48px] rounded-xl border border-white/[0.1] px-5 text-sm font-medium text-[rgb(var(--down))] transition-colors enabled:hover:border-[rgb(var(--down))] disabled:opacity-40"
        >
          ▼ Lower
        </button>
        {round?.revealed ? (
          <button
            type="button"
            onClick={newRound}
            className="col-span-2 min-h-[48px] rounded-xl bg-text-primary px-5 text-sm font-medium text-bg sm:col-span-1 sm:ml-auto"
          >
            Next chart →
          </button>
        ) : null}
      </div>

      <p className="mt-4 min-h-[3rem] text-sm text-muted" aria-live="polite">
        {result ? (
          <>
            <span
              className={
                result.correct
                  ? 'font-medium text-[rgb(var(--up))]'
                  : 'font-medium text-[rgb(var(--down))]'
              }
            >
              {result.correct ? 'Correct.' : 'Not this time.'}
            </span>{' '}
            The Nifty moved {result.pct >= 0 ? '+' : ''}
            {result.pct.toFixed(2)}% over those 10 sessions. This was {result.from} to {result.to}.
          </>
        ) : status === 'ready' ? (
          'Make your call.'
        ) : null}
      </p>
      {data ? (
        <p className="text-xs text-muted/70">Daily data: {data.source}. Not investment advice.</p>
      ) : null}
    </section>
  );
}
