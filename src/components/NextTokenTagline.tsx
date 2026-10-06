import { useEffect, useRef, useState } from 'react';
import { heroContent } from '../data/content';
import { taglineTokens } from '../data/tagline';
import { whenNameShown } from '../lib/heroName';

/**
 * The hero tagline, written one word at a time like a language model generating text, once the
 * name has finished denoising. Tapping or hovering a written word shows the other words the
 * "model" considered, with their probabilities. Screen readers get the plain sentence.
 */

const STEP_MS = 110;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function NextTokenTagline({ className = '' }: { className?: string }) {
  const [count, setCount] = useState(() => (reduceMotion() ? taglineTokens.length : 0));
  const [open, setOpen] = useState<number | null>(null);
  const rootRef = useRef<HTMLParagraphElement>(null);

  // Write the words once the name is on screen.
  useEffect(() => {
    if (reduceMotion()) return;
    let timer = 0;
    const cancel = whenNameShown(() => {
      let n = 0;
      timer = window.setInterval(() => {
        n += 1;
        setCount(n);
        if (n >= taglineTokens.length) window.clearInterval(timer);
      }, STEP_MS);
    });
    return () => {
      cancel();
      window.clearInterval(timer);
    };
  }, []);

  // A tap anywhere else, or Escape, closes the candidates.
  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const done = count >= taglineTokens.length;

  return (
    <p ref={rootRef} className={`relative ${className}`}>
      <span className="sr-only">{heroContent.tagline}</span>
      {/* Holds the finished height while the words appear, so nothing below jumps. */}
      <span className="invisible" aria-hidden>
        {heroContent.tagline}
      </span>
      <span className="absolute inset-0" aria-hidden>
        {taglineTokens.slice(0, count).map((token, i) => (
          <span key={i}>
            <span
              className={`next-token relative inline-block cursor-pointer rounded-[5px] transition-colors ${
                done ? 'next-token-done' : 'next-token-fresh'
              } ${open === i ? 'bg-accent/15 text-text-primary' : 'hover:bg-accent/10 hover:text-text-primary'}`}
              onClick={() => setOpen(open === i ? null : i)}
              onPointerEnter={(e) => e.pointerType === 'mouse' && done && setOpen(i)}
              onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(null)}
            >
              {token.word}
              {open === i ? <Candidates index={i} /> : null}
            </span>{' '}
          </span>
        ))}
      </span>
    </p>
  );
}

function Candidates({ index }: { index: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const token = taglineTokens[index];

  // Keep the popup on screen: near the right edge it opens leftwards.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.right > window.innerWidth - 12) el.style.left = `${window.innerWidth - 12 - r.right}px`;
  }, []);

  return (
    <span
      ref={ref}
      className="absolute left-0 top-full z-20 mt-1.5 block w-52 cursor-default rounded-xl border border-white/[0.1] bg-surface p-2.5 text-left font-mono text-xs text-muted shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]"
    >
      <span className="block pb-1 text-[10px] uppercase tracking-[0.14em] text-muted/70">
        next-token candidates
      </span>
      {token.candidates.map(([word, p]) => (
        <span
          key={word}
          className={`grid grid-cols-[1fr_auto] items-center gap-2 py-0.5 ${word === token.word ? 'text-text-primary' : ''}`}
        >
          <span className="min-w-0">
            {word}
            <span
              className="mt-1 block h-[3px] rounded-full bg-accent/80"
              style={{ width: `${Math.round(p * 100)}%` }}
            />
          </span>
          <span className="tabular-nums">{p.toFixed(2)}</span>
        </span>
      ))}
    </span>
  );
}
