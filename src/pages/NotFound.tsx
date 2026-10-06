import { lazy, Suspense, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { loadTerminalView, TerminalPlaceholder } from '../components/TerminalPlaceholder';

const TerminalView = lazy(loadTerminalView);

// eslint-disable-next-line react-refresh/only-export-components
export const notFoundMeta = {
  title: 'Page not found',
  description: 'This page does not exist. Find your way back to Adarsh S’s portfolio.',
};

export function NotFoundPage() {
  const { pathname } = useLocation();
  usePageMeta(notFoundMeta.title, notFoundMeta.description);

  // Keep missing URLs out of search results.
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const intro = (
    <>
      <span className="text-emerald-300/90">adarsh@portfolio</span>
      <span className="text-muted">:</span>
      <span className="text-sky-300/90">~</span>
      <span className="text-muted">$ </span>
      cd {pathname}
      {'\n'}
      <span className="text-red-300">zsh: no such file or directory: {pathname}</span>
    </>
  );

  return (
    <section className="pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent md:text-[11px]">
          404 · Page not found
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.05] tracking-tighter text-text-primary md:text-5xl">
          This page doesn’t exist.
        </h1>
        <p className="mt-3 text-base text-muted">
          The link may be old or mistyped. Use the terminal below, or head back home.
        </p>

        <div
          data-theme="dark"
          className="mt-8 h-[min(520px,62dvh)] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0b] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9)]"
        >
          <div
            className="flex h-10 items-center gap-1.5 border-b border-white/[0.06] px-4"
            aria-hidden
          >
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-auto font-mono text-[11px] text-muted">zsh</span>
          </div>
          <div className="h-[calc(100%-2.5rem)]">
            <Suspense fallback={<TerminalPlaceholder />}>
              <TerminalView
                embedded
                intro={intro}
                initialSuggestions={['cd ~', 'ls projects', 'cd work', 'help']}
              />
            </Suspense>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex h-12 items-center rounded-full bg-text-primary px-6 text-sm font-medium text-bg"
          >
            Back to home
          </Link>
          <Link
            to="/work"
            className="inline-flex h-12 items-center rounded-full border border-white/[0.12] px-6 text-sm text-text-primary"
          >
            See the work
          </Link>
        </div>
      </div>
    </section>
  );
}
