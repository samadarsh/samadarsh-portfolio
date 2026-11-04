import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { experience, heroContent, projects } from '../data/content';
import { useTerminal } from './Terminal';

/**
 * A small terminal in the hero that types a short intro once per visit, then waits with a
 * blinking cursor. Clicking it opens the full terminal. The finished text is rendered invisibly
 * underneath to reserve its height, so typing never shifts the layout.
 */

const SEEN_KEY = 'hero-terminal-typed';

type Part = { text: string; tone?: 'muted' | 'accent'; words?: boolean };
type Step = { cmd: string; out: Part[] };

const STEPS: Step[] = [
  {
    cmd: 'whoisadarsh',
    out: [
      { text: `Adarsh S — ${experience[0].role} at ${experience[0].company}` },
      { text: heroContent.tagline, tone: 'muted' },
    ],
  },
  {
    cmd: 'ls projects',
    out: [
      {
        text: `${projects
          .slice(0, 4)
          .map((p) => p.slug)
          .join(' ')} …`,
        tone: 'accent',
        words: true,
      },
    ],
  },
];

const TONE = { muted: 'text-muted', accent: 'text-accent' } as const;

const Prompt = () => (
  <>
    <span className="text-emerald-300/90">adarsh@portfolio</span>
    <span className="text-muted">:</span>
    <span className="text-sky-300/90">~</span>
    <span className="text-muted">$ </span>
  </>
);

const Caret = () => <span className="hero-term-caret" aria-hidden />;

/** How far the intro has got: `step`, characters typed of its command, and output lines shown. */
type Progress = { step: number; typed: number; lines: number; done: boolean };
const FINISHED: Progress = { step: STEPS.length, typed: 0, lines: 0, done: true };

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true;
  }
}

function useIntro(): Progress {
  const [progress, setProgress] = useState<Progress>(() =>
    alreadySeen() || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? FINISHED
      : { step: 0, typed: 0, lines: 0, done: false },
  );

  useEffect(() => {
    if (progress.done) {
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        // ignore
      }
      return;
    }
    const step = STEPS[progress.step];
    let delay: number;
    let next: Progress;
    if (progress.step === 0 && progress.typed === 0 && progress.lines === 0) {
      // Let the hero's own entrance finish first.
      delay = 1300;
      next = { ...progress, typed: 1 };
    } else if (progress.typed < step.cmd.length) {
      delay = 55;
      next = { ...progress, typed: progress.typed + 1 };
    } else if (progress.lines < step.out.length) {
      delay = progress.lines === 0 ? 260 : 120;
      next = { ...progress, lines: progress.lines + 1 };
    } else {
      delay = 450;
      next =
        progress.step + 1 < STEPS.length
          ? { step: progress.step + 1, typed: 0, lines: 0, done: false }
          : FINISHED;
    }
    const id = window.setTimeout(() => setProgress(next), delay);
    return () => window.clearTimeout(id);
  }, [progress]);

  return progress;
}

function Transcript({ progress }: { progress: Progress }) {
  const rows: ReactNode[] = [];
  STEPS.forEach((s, i) => {
    if (i > progress.step) return;
    const complete = i < progress.step;
    const typed = complete ? s.cmd : s.cmd.slice(0, progress.typed);
    const typingThis = !complete && typed.length < s.cmd.length;
    rows.push(
      <span key={`c${i}`} className="block">
        <Prompt />
        {typed}
        {typingThis ? <Caret /> : null}
      </span>,
    );
    const shown = complete ? s.out.length : progress.lines;
    s.out.slice(0, shown).forEach((part, j) =>
      rows.push(
        <span key={`o${i}-${j}`} className={`block ${part.tone ? TONE[part.tone] : ''}`}>
          {part.words
            ? // Keep names like fin-sight whole when the line wraps.
              part.text.split(' ').map((word, k) => (
                <Fragment key={k}>
                  {k ? ' ' : ''}
                  <span className="mr-[0.6em] whitespace-nowrap">{word}</span>
                </Fragment>
              ))
            : part.text}
        </span>,
      ),
    );
  });
  if (progress.done)
    rows.push(
      <span key="end" className="block">
        <Prompt />
        <Caret />
      </span>,
    );
  return <>{rows}</>;
}

export function HeroTerminal({ className = '' }: { className?: string }) {
  const terminal = useTerminal();
  const progress = useIntro();
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches);

  return (
    <button
      type="button"
      onClick={terminal.open}
      aria-label="Open the terminal"
      data-theme="dark"
      className={`hero-term group block w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0b0b] text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/40 ${progress.done ? 'is-done' : ''} ${className}`}
    >
      <span
        className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2"
        aria-hidden
      >
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-auto font-mono text-[11px] text-muted md:text-[10px]">zsh</span>
      </span>
      <span
        className="grid px-3.5 py-3 font-mono text-xs leading-relaxed text-text-primary md:text-[13px]"
        aria-hidden
      >
        {/* Reserves the finished height; the live transcript is drawn on top of it. */}
        <span className="invisible [grid-area:1/1]">
          <Transcript progress={FINISHED} />
        </span>
        <span className="[grid-area:1/1]">
          <Transcript progress={progress} />
        </span>
      </span>
      <span
        className="hero-term-hint flex items-center justify-between border-t border-white/[0.06] px-3.5 py-2 font-mono text-[11px] text-muted"
        aria-hidden
      >
        <span>{touch ? 'tap' : 'click'} to open the terminal</span>
        <span className="text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      </span>
    </button>
  );
}
