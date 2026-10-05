import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { m } from 'framer-motion';

import { loadTerminalView, TerminalPlaceholder } from './TerminalPlaceholder';

const TerminalView = lazy(loadTerminalView);

/**
 * A live terminal on the home page: visitors can browse the portfolio from a shell right
 * here, by typing or tapping the suggested commands. Loads when the section nears the screen.
 */
export function HomeTerminal() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // Fetch the shell once the page is idle, so it's ready before the visitor scrolls here.
  useEffect(() => {
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(() => void loadTerminalView(), { timeout: 4000 })
      : window.setTimeout(() => void loadTerminalView(), 2500);
    return () =>
      window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
      rootMargin: '600px 0px',
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="terminal"
      className="scroll-mt-24 pb-24 md:pb-32"
      aria-labelledby="terminal-title"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="min-w-0 lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
              Terminal
            </p>
            <h2
              id="terminal-title"
              className="mt-4 font-display text-4xl leading-[1.05] tracking-tighter text-text-primary md:text-5xl"
            >
              Prefer the <span className="italic text-text-primary/80">command line?</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
              Explore this portfolio from a shell. Read a project, walk the career history as a git
              log, or hand a question to Ash, the AI assistant.
            </p>
            <ul className="mt-6 grid gap-2 font-mono text-sm text-muted">
              {[
                ['ls projects', 'everything I have built'],
                ['cat finsight', 'read one project'],
                ['git log', 'career as commits'],
              ].map(([cmd, what]) => (
                <li key={cmd} className="flex gap-3">
                  <span className="text-accent">$</span>
                  <span className="text-text-primary">{cmd}</span>
                  <span className="text-muted/70">— {what}</span>
                </li>
              ))}
            </ul>
          </div>

          <m.div
            className="min-w-0 lg:col-span-7"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="h-[440px] w-full max-w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0b] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)] md:h-[480px]">
              <div
                className="flex h-10 items-center gap-1.5 border-b border-white/[0.06] px-4"
                aria-hidden
              >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-auto font-mono text-[11px] text-muted">
                  adarsh@portfolio — zsh
                </span>
              </div>
              <div className="h-[calc(100%-2.5rem)]">
                {near ? (
                  <Suspense fallback={<TerminalPlaceholder />}>
                    <TerminalView embedded />
                  </Suspense>
                ) : (
                  <TerminalPlaceholder />
                )}
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
