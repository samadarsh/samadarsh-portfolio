import { useEffect, useState } from 'react';
import { whenIntroDone } from '../lib/intro';

/**
 * Text that resolves out of scrambled glyphs, left to right, each time it appears. The finished
 * text is laid out invisibly to hold the space, and the scrambling copy is drawn over it, so the
 * page around it never moves. Screen readers get the real text throughout.
 */

const GLYPHS = '01<>/{}[]#$%&*+=?ΔΣλ';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// Plays every time the text mounts (so every time the home page shows), except under reduced motion.
const shouldAnimate = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Props = {
  text: string;
  /** ms before the first character settles */
  delay?: number;
  /** ms between one character settling and the next */
  step?: number;
  className?: string;
  glyphClassName?: string;
};

export function DecodeText({ text, delay = 0, step = 60, className = '', glyphClassName }: Props) {
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
        setSettled(null);
        return;
      }
      // Re-roll the glyphs about 25 times a second.
      if (now - last > 40) {
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

  return (
    <span className={`relative inline-block max-w-full ${className}`}>
      <span className="sr-only">{text}</span>
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0 overflow-hidden" aria-hidden>
        {[...text].map((ch, i) =>
          i < settled || ch === ' ' ? (
            ch
          ) : (
            <span key={i} className={glyphClassName}>
              {randomGlyph()}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
