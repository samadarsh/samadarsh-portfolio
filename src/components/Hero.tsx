import { Link } from 'react-router-dom';
import { ViewingAs } from './ViewingAs';
import { heroContent } from '../data/content';
import { CopyEmailButton, ResumeButton } from './ContactActions';
import { useAskAdarsh } from './AskAdarsh';
import { HeroTerminal } from './HeroTerminal';
import { ScrollCue } from './ScrollCue';
import { AssistantGlyph } from './AssistantGlyph';
import { DecodeText } from './DecodeText';
import { DiffusionName } from './DiffusionName';

const GLYPH = 'text-accent/70';

export function Hero() {
  const askAdarsh = useAskAdarsh();

  return (
    <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-20 pt-32 md:pb-28 lg:justify-center">
      <div className="absolute inset-x-0 top-0 -z-10 h-[70vh] bg-gradient-to-b from-accent/[0.06] via-transparent to-transparent" />
      {/* One soft, still glow; the name and tagline carry the motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,hsl(var(--accent)/0.10),transparent_62%)] md:-right-24 md:h-[760px] md:w-[760px]"
      />

      <div className="container relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p className="blur-in mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 font-mono text-xs md:text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur">
              {heroContent.available ? (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              ) : null}
              {heroContent.eyebrow}
            </p>

            <DiffusionName className="font-display text-[25vw] leading-[0.9] tracking-tightest text-text-primary sm:text-7xl sm:leading-[0.95] md:text-8xl lg:text-[8.5rem]" />

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              <DecodeText text={heroContent.tagline} delay={300} step={14} glyphClassName={GLYPH} />
            </p>
            <p className="mt-3 font-mono text-xs md:text-[11px] uppercase tracking-[0.2em] text-muted/80">
              {heroContent.location}
            </p>

            <div className="blur-in mt-8" style={{ animationDelay: '0.6s' }}>
              <div className="flex flex-wrap gap-3">
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
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => askAdarsh.open()}
                  data-magnetic
                  className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/[0.06] px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent sm:py-2.5"
                >
                  <AssistantGlyph size={16} className="text-accent" />
                  Ask Ash
                </button>
                <ResumeButton />
                <CopyEmailButton />
              </div>
              <ViewingAs />
            </div>
          </div>

          {/* On phones the terminal comes after the buttons; on desktop it sits beside the name. */}
          <div className="blur-in min-w-0" style={{ animationDelay: '0.9s' }}>
            <HeroTerminal />
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
