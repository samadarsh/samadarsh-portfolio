import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  openSource,
  openSourceProjects,
  prUrl,
  projectOf,
  type OpenSourceFixId,
} from '../data/content';
import { FIGURES } from './OpenSourceFigures';

/**
 * The About page's open-source fixes as a before/after split. Pick a fix and its drawing plays
 * the bug, then a divider sweeps in the fixed state; drag across the panel (or move the mouse
 * over it) to give either side more room. Each side keeps its drawing whole and centred in its
 * own area, so text is never cut in half. One fix shows at a time; the list keeps the overview.
 *
 * The divider is a CSS variable written straight to the panel, so dragging never re-renders.
 */

const STEP_MS = 900;
const fixesOf = (project: string) => openSource.filter((f) => f.project === project);
/** Where the divider rests: side by side where both drawings fit, otherwise on the fix. */
const restingCut = (panel: HTMLElement | null) => ((panel?.clientWidth ?? 0) >= 640 ? 50 : 0);
const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function OpenSource() {
  const [active, setActive] = useState<OpenSourceFixId>(openSource[0].id);
  const [frame, setFrame] = useState(FIGURES[openSource[0].id].bad);
  const [seen, setSeen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const raf = useRef(0);
  const dragging = useRef(false);
  const playing = useRef(false);

  const fix = openSource.find((f) => f.id === active) ?? openSource[0];
  const figure = FIGURES[fix.id];
  const project = projectOf(fix);
  const before = figure.frames[Math.min(frame, figure.bad)];
  const after = figure.frames[figure.frames.length - 1];

  const setCut = useCallback((v: number) => {
    const cut = Math.max(0, Math.min(100, v));
    panelRef.current?.style.setProperty('--osf-cut', `${cut}%`);
    knobRef.current?.classList.toggle('is-left', cut < 6);
    knobRef.current?.classList.toggle('is-right', cut > 94);
    if (sliderRef.current) sliderRef.current.value = String(Math.round(cut));
  }, []);

  // Before the intro runs, rest where it will end.
  useEffect(() => setCut(restingCut(panelRef.current)), [setCut]);

  const stop = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    cancelAnimationFrame(raf.current);
    playing.current = false;
  }, []);

  // The intro plays once the section is on screen, so the first sweep isn't spent off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play the bug frame by frame with the panel showing "before", then sweep the fix in.
  useEffect(() => {
    if (!seen) return;
    stop();
    const { bad } = FIGURES[active];
    const rest = restingCut(panelRef.current);
    if (reducedMotion()) {
      timers.current.push(window.setTimeout(() => setFrame(bad), 0));
      setCut(rest);
      return stop;
    }
    setCut(100);
    playing.current = true;
    for (let i = 0; i <= bad; i++) {
      timers.current.push(window.setTimeout(() => setFrame(i), i * STEP_MS));
    }
    timers.current.push(
      window.setTimeout(
        () => {
          const start = performance.now();
          const run = (t: number) => {
            const p = Math.min(1, (t - start) / (rest ? 900 : 1100));
            setCut(100 - (100 - rest) * (1 - Math.pow(1 - p, 3)));
            if (p < 1) raf.current = requestAnimationFrame(run);
            else playing.current = false;
          };
          raf.current = requestAnimationFrame(run);
        },
        bad * STEP_MS + 700,
      ),
    );
    return stop;
  }, [active, seen, setCut, stop]);

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCut(((e.clientX - r.left) / r.width) * 100);
  };

  // Any hand on the divider ends the intro and leaves the bug at its worst frame.
  const takeOver = () => {
    stop();
    setFrame(FIGURES[active].bad);
  };

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
          Open source
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl">
          Fixes I sent <span className="italic">upstream</span>.
        </h3>
        <p className="mt-4 max-w-xl text-sm text-muted md:text-base">
          Bug fixes and docs for IBM Granite Switch, OpenAlgo and OpenClaw. Pick one and drag across
          it to see what changed.
        </p>

        {/* Phones: the three projects as tabs, then that project's fixes. */}
        <div className="mt-6 lg:hidden">
          <div role="group" aria-label="Projects" className="grid grid-cols-3 gap-1.5">
            {openSourceProjects.map((p) => {
              const fixes = fixesOf(p.name);
              const on = p.name === project.name;
              return (
                <button
                  key={p.repo}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(fixes[0].id)}
                  className={`grid min-h-[44px] content-start gap-0.5 rounded-2xl border px-2.5 py-2.5 text-left transition-colors ${
                    on ? 'border-accent/50 bg-surface' : 'border-white/[0.08]'
                  }`}
                >
                  <span
                    className={`truncate font-mono text-[11px] tracking-[0.04em] ${on ? 'osf-pick-project' : 'text-muted'}`}
                  >
                    {p.org ?? p.repo.split('/')[0]}
                  </span>
                  <span className="font-display text-base leading-tight tracking-tight text-text-primary">
                    {p.short}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {fixes.length} {fixes.length === 1 ? 'fix' : 'fixes'}
                  </span>
                </button>
              );
            })}
          </div>
          <div
            role="group"
            aria-label={`${project.name} fixes`}
            className="osf-picks -mx-6 mt-2.5 flex gap-2 overflow-x-auto px-6 pb-1"
          >
            {fixesOf(project.name).map((f) => {
              const on = f.id === active;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(f.id)}
                  className={`flex-shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors ${
                    on
                      ? 'border-accent/50 bg-surface text-text-primary'
                      : 'border-white/[0.08] text-muted hover:text-text-primary'
                  }`}
                >
                  {f.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Laptops: the fixes grouped under each project, with its repository. */}
        <div className="mt-8 hidden gap-6 lg:grid">
          {openSourceProjects.map((p) => (
            <div key={p.repo}>
              <h4 className="font-display text-[22px] leading-tight tracking-tight text-text-primary">
                {p.name}
              </h4>
              <a
                href={`https://github.com/${p.repo}`}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-block font-mono text-[11px] text-muted transition-colors hover:text-text-primary"
              >
                {p.repo}
              </a>
              <div role="group" aria-label={`${p.name} fixes`} className="mt-2 grid gap-0.5">
                {fixesOf(p.name).map((f) => {
                  const on = f.id === active;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(f.id)}
                      className={`rounded-xl px-3 py-2 text-left text-[15px] leading-snug transition-colors ${
                        on ? 'bg-surface text-text-primary' : 'text-muted hover:text-text-primary'
                      }`}
                    >
                      {f.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 content-start gap-4 lg:col-span-8">
        <div className="lg:hidden">
          <p className="font-mono text-[11px] tracking-[0.04em]">
            <span className="text-accent">{project.name}</span>
            <span className="text-muted"> · </span>
            <a
              href={`https://github.com/${project.repo}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted underline decoration-white/20 underline-offset-2"
            >
              {project.repo}
            </a>
          </p>
          <h4 className="mt-1 font-display text-2xl leading-tight tracking-tight text-text-primary">
            {fix.title}
          </h4>
        </div>

        <div
          ref={panelRef}
          className="osf-panel"
          onPointerDown={(e) => {
            takeOver();
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            fromPointer(e);
          }}
          onPointerMove={(e) => {
            if (!dragging.current && e.pointerType !== 'mouse') return;
            if (playing.current) takeOver();
            fromPointer(e);
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <div className="osf-region osf-before">
            <span className="osf-tag is-bad">Before</span>
            <div key={`${fix.id}-${frame}`} className="osf-fig">
              {before()}
            </div>
          </div>
          <div className="osf-region osf-after" aria-hidden>
            <span className="osf-tag is-good">After</span>
            <div className="osf-fig">
              {after()}
            </div>
          </div>
          <div ref={knobRef} className="osf-knob" aria-hidden />
        </div>

        <input
          ref={sliderRef}
          type="range"
          min={0}
          max={100}
          defaultValue={50}

          aria-label="Compare before and after"
          className="osf-slider"
          onInput={(e) => {
            takeOver();
            setCut(Number(e.currentTarget.value));
          }}
        />

        <div className="grid gap-3 md:grid-cols-2" aria-live="polite">
          <p className="rounded-2xl bg-surface p-4 text-sm leading-relaxed text-muted md:p-5 md:text-[15px]">
            <span className="osf-label is-bad">What was broken</span>
            {fix.before}
          </p>
          <p className="rounded-2xl bg-surface p-4 text-sm leading-relaxed text-muted md:p-5 md:text-[15px]">
            <span className="osf-label is-good">What I changed</span>
            {fix.after}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <p className="min-w-0 flex-1 basis-60 text-sm text-muted">
            <span className="text-text-primary">
              {project.name}
            </span>
            , {project.about}.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {fix.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {t}
              </span>
            ))}
            <a
              href={prUrl(project.repo, fix.prs[0].number)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/[0.1] px-4 text-sm text-text-primary transition-colors hover:border-accent/50"
            >
              View the change <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
