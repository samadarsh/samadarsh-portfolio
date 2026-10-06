import { useRef, type KeyboardEvent } from 'react';
import { audienceViews } from '../data/audiences';
import { useAudience } from '../hooks/useAudience';
import { AUDIENCES, setAudience } from '../lib/audience';

/**
 * "Viewing as" switch under the hero buttons. Picking who you are reorders the home page below and
 * retunes a few intro lines; the note says what changed. Works as a radio group (arrow keys move).
 */
export function ViewingAs() {
  const audience = useAudience();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const step =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + AUDIENCES.length) % AUDIENCES.length;
    setAudience(AUDIENCES[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className="mt-6">
      <div
        role="radiogroup"
        aria-label="Viewing as"
        className="flex flex-wrap items-center gap-1.5"
      >
        <span
          className="mr-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted"
          aria-hidden
        >
          Viewing as
        </span>
        {AUDIENCES.map((id, i) => {
          const active = id === audience;
          return (
            <button
              key={id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => setAudience(id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`min-h-[40px] rounded-full border px-3.5 text-sm transition-colors ${
                active
                  ? 'border-accent/60 bg-accent/[0.12] text-text-primary'
                  : 'border-white/[0.08] text-muted hover:border-white/[0.16] hover:text-text-primary'
              }`}
            >
              {audienceViews[id].label}
            </button>
          );
        })}
      </div>
      <p className="mt-2.5 text-sm text-muted" aria-live="polite">
        {audienceViews[audience].note}
      </p>
    </div>
  );
}
