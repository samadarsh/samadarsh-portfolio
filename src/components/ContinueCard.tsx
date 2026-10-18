import { Link } from 'react-router-dom';

type ContinueCardProps = {
  to: string;
  title: string;
  teaser: string;
};

/**
 * The end of a page points to the next one, so a visitor who reads to the bottom (most of them
 * on phones, where the menu is behind ☰) can keep going without scrolling back up. One
 * destination per page, in the same spirit as the case studies' Previous / Next cards.
 */
export function ContinueCard({ to, title, teaser }: ContinueCardProps) {
  return (
    <nav aria-label="Continue reading" className="container mx-auto max-w-6xl px-6 pt-8 md:pt-12">
      <Link
        to={to}
        data-magnetic
        className="group flex items-center justify-between gap-6 rounded-3xl border border-white/[0.08] bg-surface/40 p-6 transition-colors hover:border-accent/40 hover:bg-surface/70 md:p-10"
      >
        <span className="min-w-0">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
            Continue
          </span>
          <span className="mt-3 block font-display text-3xl leading-tight tracking-tight text-text-primary md:text-5xl">
            {title}
          </span>
          <span className="mt-3 block max-w-xl text-sm leading-relaxed text-muted md:text-base">
            {teaser}
          </span>
        </span>
        <span
          aria-hidden
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-xl text-text-primary transition group-hover:translate-x-1 group-hover:border-accent group-hover:bg-accent group-hover:text-bg md:h-16 md:w-16 md:text-2xl"
        >
          →
        </span>
      </Link>
    </nav>
  );
}
