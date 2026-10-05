import { scrollToElement } from '../lib/smoothScroll';

/**
 * Scroll cue for the home hero, desktop only: a glowing dot sliding down a thin line (the same
 * pulse as the "How it works" diagrams). Clicking it scrolls to the next section. Phones don't get
 * one: the hero terminal card already peeks in at the bottom of the screen.
 */
export function ScrollCue() {
  return (
    <button
      type="button"
      aria-label="Scroll to content"
      onClick={(e) => {
        const next = e.currentTarget.closest('section')?.nextElementSibling;
        if (next instanceof HTMLElement) scrollToElement(next);
      }}
      className="scroll-cue-button absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:block"
    >
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
    </button>
  );
}
