import { useEffect, useRef, useState } from 'react';
import { useArcade } from '../hooks/useArcade';
import { setArcade } from '../lib/arcade';

/**
 * While arcade mode is on: a small "Insert coin · Exit" control, the only way out on phones (no
 * Esc key). It sits under the navbar on phones, clear of the bottom action bar, and in the bottom
 * left corner on larger screens. Screen readers hear when the mode turns on or off.
 */
export function ArcadeBar() {
  const on = useArcade();
  const [message, setMessage] = useState('');
  const first = useRef(true);

  useEffect(() => {
    // Don't announce a mode restored on page load, only a change.
    if (first.current) {
      first.current = false;
      return;
    }
    setMessage(on ? 'Arcade mode on. Use Exit arcade or Escape to leave.' : 'Arcade mode off.');
  }, [on]);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      {on ? (
        <button
          type="button"
          onClick={() => setArcade(false)}
          className="arcade-bar fixed left-1/2 top-[calc(max(1.25rem,env(safe-area-inset-top))+4.25rem)] z-30 flex min-h-[40px] -translate-x-1/2 items-center gap-3 whitespace-nowrap border-2 border-accent bg-bg px-3.5 text-[11px] uppercase tracking-wider text-text-primary md:bottom-6 md:left-6 md:top-auto md:translate-x-0"
        >
          <span className="arcade-blink text-accent" aria-hidden>
            Insert coin
          </span>
          <span>
            <span className="hidden md:inline">Esc · </span>Exit arcade ✕
          </span>
        </button>
      ) : null}
    </>
  );
}
