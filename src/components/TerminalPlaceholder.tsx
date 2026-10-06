import { experience, heroContent } from '../data/content';

/**
 * The terminal's opening screen, drawn instantly while the interactive shell (TerminalView, loaded
 * on demand) downloads, so the box is never blank. It mirrors TerminalView's layout exactly, so the
 * swap is seamless.
 */

// "ADARSH" in figlet's Small font, kept narrow enough for a 360px phone.
const GLYPHS: Record<string, string[]> = {
  A: ['   _   ', '  /_\\  ', ' / _ \\ ', '/_/ \\_\\'],
  D: [' ___  ', '|   \\ ', '| |) |', '|___/ '],
  R: [' ___ ', '| _ \\', '|   /', '|_|_\\'],
  S: [' ___ ', '/ __|', '\\__ \\', '|___/'],
  H: [' _  _ ', '| || |', '| __ |', '|_||_|'],
};
export const BANNER = [0, 1, 2, 3]
  .map((row) => [...'ADARSH'].map((c) => GLYPHS[c][row]).join(''))
  .join('\n');

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_SUGGESTIONS = [
  'whoisadarsh',
  'ls projects',
  'cat bite-wise',
  'git log',
  'help',
];

// eslint-disable-next-line react-refresh/only-export-components
export const loadTerminalView = () => import('./TerminalView');

export function TerminalPlaceholder() {
  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 flex-col font-mono text-[13px] leading-relaxed text-text-primary md:text-sm"
      aria-busy="true"
    >
      <div className="min-h-0 flex-1 overflow-hidden px-4 pb-3 pt-4 [container-type:inline-size] md:px-5">
        <pre
          className="m-0 select-none overflow-hidden text-[min(13px,4.4cqi)] leading-[1.15] text-accent"
          aria-label="Adarsh"
        >
          {BANNER}
        </pre>
        <p className="mt-3 whitespace-pre-wrap text-muted">
          {experience[0].role} · {heroContent.location}
          {'\n'}Type <span className="text-accent">help</span> for commands, or tap one below.
        </p>
      </div>
      <div className="border-t border-white/[0.06] bg-black/20" aria-hidden>
        <div className="terminal-chips flex w-full min-w-0 flex-wrap gap-2 px-3 pt-2.5">
          {DEFAULT_SUGGESTIONS.map((s) => (
            <span
              key={s}
              className="flex h-11 shrink-0 items-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-xs text-text-primary/60 md:h-9"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 md:px-5">
          <span className="text-emerald-300/90">~</span>
          <span className="text-muted">$</span>
          <span className="flex h-11 items-center text-base text-muted/60 md:h-auto md:text-sm">
            type a command…
          </span>
        </div>
      </div>
    </div>
  );
}
