import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { socialLinks } from '../data/content';
import { activityStats, type GitHubActivity as Activity } from '../lib/github';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const githubUrl = socialLinks.find((l) => l.label === 'GitHub')!.href;

const formatDay = (iso: string) => {
  const [y, mo, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[mo - 1]} ${y}`;
};
const plural = (n: number, word: string) =>
  `${n.toLocaleString('en-IN')} ${word}${n === 1 ? '' : 's'}`;

type State = { status: 'idle' | 'loading' | 'error' } | { status: 'ready'; data: Activity };

/**
 * The last year of GitHub contributions as a heatmap, from /api/github (cached at the edge).
 * Fetches once the section is near the screen; if the API is unavailable, the whole section
 * stays hidden rather than showing a broken state.
 */
export function GitHubActivity() {
  const ref = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>({ status: 'idle' });
  const [seen, setSeen] = useState(false);
  const [picked, setPicked] = useState<[string, number] | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setState({ status: 'loading' });
        fetch('/api/github')
          .then((r) => (r.ok ? (r.json() as Promise<Activity>) : Promise.reject(r.status)))
          .then((data) => {
            if (!Array.isArray(data.weeks) || !data.weeks.length) throw new Error('empty');
            setState({ status: 'ready', data });
          })
          .catch(() => setState({ status: 'error' }));
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Reveal once the grid itself scrolls into view.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || state.status !== 'ready') return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), {
      threshold: 0.3,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [state.status]);

  // On narrow screens the grid scrolls sideways; start at the most recent weeks.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el && state.status === 'ready') el.scrollLeft = el.scrollWidth;
  }, [state.status]);

  const data = state.status === 'ready' ? state.data : null;
  const stats = useMemo(() => (data ? activityStats(data) : null), [data]);
  const monthLabels = useMemo(() => {
    if (!data) return [];
    let last = -1;
    return data.weeks.map((week, w) => {
      const month = Number(week[0][0].slice(5, 7)) - 1;
      // A label in the last two columns would stick out past the grid.
      if (month === last || w > data.weeks.length - 3) return '';
      last = month;
      return MONTHS[month];
    });
  }, [data]);

  if (state.status === 'error') return null;

  const latest = data ? data.weeks[data.weeks.length - 1].at(-1)! : null;
  const readout = picked ?? (latest ? [latest[0], latest[1]] : null);

  return (
    <section
      ref={ref}
      id="github"
      className="scroll-mt-20 pb-24 md:pb-32"
      aria-labelledby="github-title"
    >
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
              Code activity
            </p>
            <h3
              id="github-title"
              className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl"
            >
              Shipping, <span className="italic">week after week.</span>
            </h3>
            <p className="mt-4 text-sm text-muted md:text-base">
              Public contributions on GitHub over the last year, updated every few hours.
            </p>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-white/[0.12] px-5 text-sm text-text-primary transition-colors hover:border-accent/40"
            >
              github.com/{data?.login ?? 'samadarsh'} ↗
            </a>
          </div>

          <div className="min-w-0 md:col-span-8">
            <dl className="grid grid-cols-3 gap-3">
              {[
                ['Total', 'Contributions', data ? data.total.toLocaleString('en-IN') : '—'],
                ['Longest streak', 'Longest streak', stats ? plural(stats.longest, 'day') : '—'],
                ['Current streak', 'Current streak', stats ? plural(stats.current, 'day') : '—'],
              ].map(([short, label, value]) => (
                <div
                  key={label}
                  className="flex flex-col justify-between gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 md:p-4"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted md:text-[10px] md:tracking-[0.14em]">
                    {/* "Contributions" doesn't fit a third of a phone screen */}
                    <span className="md:hidden">{short}</span>
                    <span className="hidden md:inline">{label}</span>
                  </dt>
                  <dd className="font-display text-xl tabular-nums tracking-tight text-text-primary md:text-2xl">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 md:p-4">
              <div
                ref={scrollerRef}
                className="gh-scroll overflow-x-auto overscroll-x-contain pb-1"
                data-lenis-prevent
              >
                {data ? (
                  <div
                    className={`gh-grid ${seen ? 'gh-seen' : ''}`}
                    style={{
                      gridTemplateColumns: `repeat(${data.weeks.length}, minmax(10px, 1fr))`,
                    }}
                    role="img"
                    aria-label={`${plural(data.total, 'contribution')} on GitHub in the last year. Longest streak ${plural(stats!.longest, 'day')}.`}
                    onPointerLeave={() => setPicked(null)}
                  >
                    {monthLabels.map((label, w) => (
                      <span
                        key={`m${w}`}
                        className="gh-month"
                        style={{ gridColumn: w + 1 }}
                        aria-hidden
                      >
                        {label}
                      </span>
                    ))}
                    {data.weeks.map((week, w) =>
                      week.map(([date, count, level]) => (
                        <span
                          key={date}
                          className={`gh-cell gh-l${level}`}
                          style={{
                            gridColumn: w + 1,
                            gridRow: new Date(`${date}T00:00:00Z`).getUTCDay() + 2,
                            transitionDelay: `${w * 9}ms`,
                          }}
                          onPointerEnter={() => setPicked([date, count])}
                          onClick={() => setPicked([date, count])}
                          aria-hidden
                        />
                      )),
                    )}
                  </div>
                ) : (
                  <div
                    className="gh-grid gh-skeleton"
                    role="status"
                    aria-busy="true"
                    aria-label="Loading GitHub activity"
                  >
                    {Array.from({ length: 53 * 7 }, (_, i) => (
                      <span
                        key={i}
                        className="gh-cell"
                        style={{ gridColumn: Math.floor(i / 7) + 1, gridRow: (i % 7) + 2 }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted">
                <p aria-live="polite" className="tabular-nums">
                  {readout
                    ? `${readout[1] ? plural(readout[1], 'contribution') : 'No contributions'} on ${formatDay(readout[0])}`
                    : 'Loading…'}
                </p>
                <div className="flex items-center gap-1.5" aria-hidden>
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((l) => (
                    <span key={l} className={`gh-cell gh-key gh-l${l}`} />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
