import { Link } from 'react-router-dom';
import { scrollToElement } from '../lib/smoothScroll';
import { heroContent } from '../data/content';
import { CopyEmailButton, ResumeButton } from './ContactActions';
import { HeroNetwork } from './HeroNetwork';
import { useAskAdarsh } from './AskAdarsh';
import { AssistantGlyph } from './AssistantGlyph';

export function Hero() {
  const askAdarsh = useAskAdarsh();

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-20 pt-32 md:pb-28"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-gradient-to-b from-accent/[0.06] via-transparent to-transparent" />
      <HeroNetwork />

      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1 min-w-0">
            <p className="blur-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-xs md:text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur">
              {heroContent.available ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              ) : null}
              {heroContent.eyebrow}
            </p>

            <h1 className="font-display text-[25vw] leading-[0.9] tracking-tightest text-text-primary sm:text-7xl sm:leading-[0.95] md:text-8xl lg:text-[9.5rem]">
              <span className="name-reveal block overflow-hidden">
                <span className="block">Adarsh</span>
              </span>
              <span className="name-reveal block overflow-hidden">
                <span className="block italic text-text-primary/90">S.</span>
              </span>
            </h1>
          </div>

          <div className="blur-in max-w-md lg:text-right" style={{ animationDelay: '0.43s' }}>
            <p className="text-base leading-relaxed text-muted md:text-lg">{heroContent.tagline}</p>
            <p className="mt-4 font-mono text-xs md:text-[11px] uppercase tracking-[0.2em] text-muted/80">
              {heroContent.location}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/work"
                data-magnetic
                className="group inline-flex grow items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/[0.1] bg-white/[0.02] px-5 py-3 text-sm sm:grow-0 sm:py-2.5 font-medium text-text-primary backdrop-blur transition hover:border-accent/40 hover:bg-white/[0.04]"
              >
                <span>See selected work</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <a
                href="#contact"
                data-magnetic
                className="group inline-flex grow items-center justify-center gap-2 whitespace-nowrap rounded-full bg-text-primary px-5 py-3 text-sm sm:grow-0 sm:py-2.5 font-medium text-bg transition hover:bg-text-primary/90"
              >
                Get in touch
              </a>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() => askAdarsh.open()}
                data-magnetic
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/[0.06] px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent sm:py-2.5"
              >
                <AssistantGlyph size={16} className="text-accent" />
                Ask Adarsh
              </button>
              <ResumeButton />
              <CopyEmailButton />
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Scroll to content"
        onClick={(e) => {
          const next = e.currentTarget.closest('section')?.nextElementSibling;
          if (next instanceof HTMLElement) scrollToElement(next);
        }}
        className="absolute bottom-8 left-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/[0.14] text-text-primary/70 transition-colors hover:border-accent/50 hover:text-text-primary lg:flex"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-scroll-down"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </section>
  );
}
