import { Link } from 'react-router-dom';
import { projects } from '../data/content';

/**
 * The site read as a sequence, in the same order as the navbar: Home → About → Work → Haugtun
 * Research, then back to the start. Each page ends with a large card to the next page and a
 * smaller one back to the previous, so a visitor who reads to the bottom (most of them on phones,
 * where the menu is behind ☰) can carry on either way without scrolling back up.
 */

type Stop = { path: string; label: string; title: string; teaser: string };

const SEQUENCE: Stop[] = [
  {
    path: '/',
    label: 'Home',
    title: 'Back to the start',
    teaser: 'The hero, selected work and the agent demo.',
  },
  {
    path: '/about',
    label: 'About',
    title: 'Who built these',
    teaser: 'Experience, research papers and the stack behind the projects.',
  },
  {
    path: '/work',
    label: 'Work',
    title: 'See what I’ve built',
    teaser: `${projects.length} projects, from agents to speech AI, each with how it works and what it measured.`,
  },
  {
    path: '/journal',
    label: 'Haugtun Research',
    title: 'The markets side',
    teaser: 'Writing on markets and investing, and a game: read the Nifty 50 chart.',
  },
];

export function PageSequence({ current }: { current: '/about' | '/work' | '/journal' }) {
  const i = SEQUENCE.findIndex((s) => s.path === current);
  const prev = SEQUENCE[i - 1];
  const next = SEQUENCE[(i + 1) % SEQUENCE.length];

  return (
    <nav
      aria-label="Continue reading"
      className="container mx-auto grid max-w-6xl grid-cols-1 gap-3 px-6 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:pt-12"
    >
      {/* Next first in the source and on phones; on wider screens it sits on the right. */}
      <Link
        to={next.path}
        data-magnetic
        className="group flex items-center justify-between gap-6 rounded-3xl border border-white/[0.08] bg-surface/40 p-6 transition-colors hover:border-accent/40 hover:bg-surface/70 md:order-2 md:p-10"
      >
        <span className="min-w-0">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
            Next · {next.label}
          </span>
          <span className="mt-3 block font-display text-3xl leading-tight tracking-tight text-text-primary md:text-5xl">
            {next.title}
          </span>
          <span className="mt-3 block max-w-xl text-sm leading-relaxed text-muted md:text-base">
            {next.teaser}
          </span>
        </span>
        <span
          aria-hidden
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-xl text-text-primary transition group-hover:translate-x-1 group-hover:border-accent group-hover:bg-accent group-hover:text-bg md:h-16 md:w-16 md:text-2xl"
        >
          →
        </span>
      </Link>
      <Link
        to={prev.path}
        className="group flex min-h-[64px] items-center gap-4 rounded-3xl border border-white/[0.06] px-6 py-4 transition-colors hover:border-accent/40 md:order-1 md:flex-col md:items-start md:justify-center md:gap-2 md:p-10"
      >
        <span
          aria-hidden
          className="text-lg text-muted transition group-hover:-translate-x-1 group-hover:text-accent"
        >
          ←
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-xs uppercase tracking-[0.2em] text-muted md:text-[11px]">
            Previous
          </span>
          <span className="block font-display text-xl tracking-tight text-text-primary md:mt-1 md:text-2xl">
            {prev.label}
          </span>
        </span>
      </Link>
    </nav>
  );
}
