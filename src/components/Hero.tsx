import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { heroContent } from '../data/content';
import { heroProofs, heroProofSentence } from '../data/heroProofs';
import { useTheme } from '../hooks/useTheme';
import { subscribeArcade } from '../lib/arcade';
import { markNameShown, resetNameShown } from '../lib/heroName';
import { ResumeButton } from './ContactActions';
import { inkReveal } from './hero/inkReveal';
import { pixelLens } from './hero/pixelLens';
import { NextTokenTagline } from './NextTokenTagline';
import { ScrollCue } from './ScrollCue';

/**
 * The home hero: a full-screen canvas where the visitor's pointer reveals the measured results
 * behind the name. Paper gets the ink reveal, Espresso gets the pixel lens; switching theme swaps
 * them live. The name, results and links are all real page content; the canvas is decoration.
 * Everything else that used to sit here (terminal, Ask Ash, contact buttons) is in HeroExtras.
 */
export function Hero() {
  const hostRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const [role, focus] = heroContent.eyebrow.split(' · ');

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const engine = theme === 'light' ? inkReveal : pixelLens;
    resetNameShown();
    let stop = engine(host, canvas, { proofs: heroProofs, reduced, onIntroDone: markNameShown });
    // Arcade mode recolours the tokens; restart so the canvas picks the new colours up.
    const unsubscribe = subscribeArcade(() => {
      stop();
      stop = engine(host, canvas, { proofs: heroProofs, reduced, onIntroDone: markNameShown });
    });
    return () => {
      unsubscribe();
      stop();
    };
  }, [theme]);

  return (
    <section ref={hostRef} className="relative h-[100svh] min-h-[560px] overflow-hidden bg-bg">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full touch-pan-y" />
      <h1 className="sr-only">Adarsh S</h1>
      <p className="sr-only">{heroProofSentence}</p>

      <div className="hero-corners pointer-events-none absolute inset-x-0 top-[calc(max(1.25rem,env(safe-area-inset-top))+5rem)] z-10 flex justify-between gap-6 px-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] md:px-8">
        <p className="blur-in flex gap-2" style={{ animationDelay: '0.15s' }}>
          {heroContent.available ? (
            <span className="relative mt-[0.45em] flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          ) : null}
          <span>
            <span className="block text-text-primary">{role}</span>
            <span className="block text-muted">{focus}</span>
          </span>
        </p>
        <p className="blur-in hidden text-right sm:block" style={{ animationDelay: '0.25s' }}>
          <span className="block text-text-primary">{heroContent.location}</span>
          <span className="block text-muted">{theme === 'light' ? 'Ink shows the proof' : 'Research → production'}</span>
        </p>
      </div>

      {/* On wider screens the right edge leaves room for the floating Ask Ash bubble. */}
      <div className="hero-foot absolute inset-x-0 bottom-0 z-10 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-8 md:pl-8 md:pr-24">
        <div data-hero-ui className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <NextTokenTagline popUp className="max-w-md text-base leading-relaxed text-text-primary md:text-lg" />
          <div className="blur-in flex flex-wrap gap-3" style={{ animationDelay: '0.55s' }}>
            <Link
              to="/work"
              data-magnetic
              className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition hover:bg-text-primary/90 sm:py-2.5"
            >
              <span>See the work</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <ResumeButton className="bg-bg/60 backdrop-blur" />
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
