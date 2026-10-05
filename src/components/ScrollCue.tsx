import { useEffect, useState } from 'react';
import { scrollToElement } from '../lib/smoothScroll';

/** A glowing dot sliding down a thin line, the same pulse as the "How it works" diagrams. */
function Pulse() {
  return (
    <span className="scroll-cue" aria-hidden>
      <i />
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}

/**
 * Scroll cue for the home hero. Desktop: at the bottom of the hero, clickable, scrolls to the next
 * section. Phones: the hero is taller than the screen, so it floats at the bottom of the screen
 * while the visitor is at the top and fades out once they scroll; it never blocks taps.
 */
export function ScrollCue() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Scroll to content"
        onClick={(e) => {
          const next = e.currentTarget.closest('section')?.nextElementSibling;
          if (next instanceof HTMLElement) scrollToElement(next);
        }}
        className="scroll-cue-button absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:block"
      >
        <Pulse />
      </button>
      <div
        className={`pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 transition-opacity duration-500 lg:hidden ${
          atTop ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* A small pill so the cue stays legible over whatever scrolls beneath it */}
        <span className="block rounded-full border border-white/[0.08] bg-bg/70 px-1.5 py-2 backdrop-blur-md">
          <Pulse />
        </span>
      </div>
    </>
  );
}
