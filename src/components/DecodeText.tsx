import { Fragment, useEffect, useState } from 'react';
import { whenIntroDone } from '../lib/intro';

/**
 * Text that resolves out of scrambled glyphs, left to right, the first time the hero is seen in a
 * visit. Each character keeps the width of its final letter while it scrambles, so nothing around
 * it moves; once settled it becomes plain text again. Screen readers get the real text throughout.
 */

const SEEN_KEY = 'hero-decoded';
const GLYPHS = '01<>/{}[]#$%*+=?';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Read once per page load, so every DecodeText on the page agrees on whether to animate.
let animateThisLoad: boolean | null = null;
function shouldAnimate() {
  if (animateThisLoad === null) {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      // Storage blocked: just play it.
    }
    animateThisLoad = !seen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return animateThisLoad;
}

type Props = {
  text: string;
  /** ms before the first character settles */
  delay?: number;
  /** ms between one character settling and the next */
  step?: number;
  className?: string;
  glyphClassName?: string;
};

export function DecodeText({ text, delay = 0, step = 60, className, glyphClassName }: Props) {
  // Number of characters settled so far; null once finished (or when not animating).
  const [settled, setSettled] = useState<number | null>(() => (shouldAnimate() ? 0 : null));
  const [, setTick] = useState(0);

  useEffect(() => {
    if (settled === null) return;
    let raf = 0;
    let last = 0;
    let start = 0;
    const frame = (now: number) => {
      const done = Math.floor((now - start - delay) / step) + 1;
      if (done >= text.length) {
        // Later visits to the home page in this load show the text straight away.
        animateThisLoad = false;
        setSettled(null);
        return;
      }
      // Re-roll the glyphs about 20 times a second; faster reads as noise.
      if (now - last > 50) {
        last = now;
        setSettled(Math.max(0, done));
        setTick((t) => t + 1);
      }
      raf = requestAnimationFrame(frame);
    };
    // Wait for the intro loader to leave, so the decode is actually seen.
    const cancel = whenIntroDone(() => {
      start = performance.now();
      raf = requestAnimationFrame(frame);
    });
    return () => {
      cancel();
      cancelAnimationFrame(raf);
    };
    // Runs once; `settled` only gates the start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay, step]);

  if (settled === null) return <span className={className}>{text}</span>;

  // Words stay unbreakable so the scrambling text wraps exactly like the final text.
  let index = 0;
  const words = text.split(' ');
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, w) => {
          const chars = [...word].map((ch) => {
            const i = index++;
            if (i < settled) return <span key={i}>{ch}</span>;
            return (
              <span key={i} className="relative inline-block">
                <span className="invisible">{ch}</span>
                <span
                  className={`absolute inset-0 overflow-hidden text-center ${glyphClassName ?? ''}`}
                >
                  {randomGlyph()}
                </span>
              </span>
            );
          });
          index++; // the space
          return (
            <Fragment key={w}>
              <span className="whitespace-nowrap">{chars}</span>
              {w < words.length - 1 ? ' ' : null}
            </Fragment>
          );
        })}
      </span>
    </span>
  );
}
