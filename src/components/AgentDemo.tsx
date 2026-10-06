import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadResume } from '../lib/contact';
import { contact } from '../data/content';
import { SectionHeader } from './SectionHeader';

/**
 * "Watch an agent explore my work": a small copy of the site with an agent cursor that reads,
 * clicks projects and narrates its loop (thought → action → observation). Purely a demo: the
 * cards are real links for the visitor, the agent only points at them. It pauses while the
 * visitor touches or points at it, runs only while on screen, and under reduced motion shows the
 * finished log without moving.
 */

type Step =
  | { kind: 'thought'; text: string }
  | { kind: 'action'; text: string; target: string | null }
  | { kind: 'observation'; text: string };

const PLAN: Step[] = [
  { kind: 'thought', text: 'Find out what Adarsh builds.' },
  { kind: 'action', text: 'read("hero")', target: null },
  { kind: 'observation', text: 'AI Engineer · Chennai' },
  { kind: 'thought', text: 'Check the strongest AI project.' },
  { kind: 'action', text: 'click("FinSight")', target: 'fin' },
  { kind: 'observation', text: 'RAG over financial PDFs, page citations' },
  { kind: 'thought', text: 'Does he build agents too?' },
  { kind: 'action', text: 'click("BiteWise")', target: 'bite' },
  { kind: 'observation', text: 'Agents over Swiggy MCP' },
  { kind: 'thought', text: 'Something unusual: speech.' },
  { kind: 'action', text: 'click("VoiceNote AI")', target: 'voice' },
  { kind: 'observation', text: 'Whisper Tamil speech → Latin script' },
  { kind: 'thought', text: 'Enough evidence. Recommend contact.' },
  { kind: 'action', text: 'click("Get in touch")', target: 'contact' },
  { kind: 'observation', text: contact.email },
];

const CARDS = [
  { id: 'fin', title: 'FinSight', tag: 'RAG', to: '/work/fin-sight' },
  { id: 'bite', title: 'BiteWise', tag: 'Agents', to: '/work/bite-wise' },
  { id: 'voice', title: 'VoiceNote AI', tag: 'Speech', to: '/work/voicenote-ai' },
  { id: 'repo', title: 'RepoMind', tag: 'Dev tools', to: '/work/repomind' },
];

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AgentDemo() {
  const miniRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<Step[]>(() => (reduceMotion() ? PLAN : []));
  const [focus, setFocus] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const mini = miniRef.current;
    const cursor = cursorRef.current;
    if (!mini || !cursor || reduceMotion()) return;
    let stopped = false;
    const io = new IntersectionObserver(([e]) => (visibleRef.current = e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(mini);

    const waitWhile = async () => {
      while (!stopped && (pausedRef.current || !visibleRef.current)) await sleep(300);
    };
    const moveTo = (target: string | null) => {
      const el = target
        ? mini.querySelector<HTMLElement>(`[data-agent="${target}"]`)
        : mini.querySelector('h3');
      if (!el) return;
      const m = mini.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      cursor.style.transform = `translate(${r.left - m.left + r.width * 0.6}px, ${r.top - m.top + r.height * 0.55}px)`;
      setFocus(target);
    };

    (async () => {
      while (!stopped) {
        setLog([]);
        setFocus(null);
        for (const step of PLAN) {
          await waitWhile();
          if (stopped) return;
          setLog((l) => [...l, step].slice(-12));
          if (step.kind === 'action') {
            moveTo(step.target);
            await sleep(900);
          }
          await sleep(600);
        }
        await sleep(2500);
      }
    })();

    return () => {
      stopped = true;
      io.disconnect();
    };
  }, []);

  // Touching or pointing at the demo hands control to the visitor for a few seconds.
  const pauseTimer = useRef(0);
  const takeOver = () => {
    setPaused(true);
    window.clearTimeout(pauseTimer.current);
    pauseTimer.current = window.setTimeout(() => setPaused(false), 3000);
  };
  useEffect(() => () => window.clearTimeout(pauseTimer.current), []);

  const tone = {
    thought: 'text-text-primary/80',
    action: 'text-accent',
    observation: 'text-[rgb(var(--up))]',
  };

  return (
    <section className="pb-24 md:pb-32">
      <div className="container mx-auto max-w-6xl px-6">
        <SectionHeader
          kicker="Watch an agent explore my work"
          title="It reads, decides,"
          italic="then acts."
          subtitle="An agent loop running live: thought, action, observation. Touch it and it waits for you."
        />
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.015] md:grid-cols-[minmax(0,1fr)_340px]">
          <div
            ref={miniRef}
            className="relative min-w-0 p-5 md:p-7"
            onPointerMove={takeOver}
            onPointerDown={takeOver}
          >
            <h3 className="font-display text-3xl tracking-tight text-text-primary md:text-4xl">
              Adarsh S.
            </h3>
            <p className="mt-1.5 text-sm text-muted">AI Engineer · Chennai</p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {CARDS.map((c) => (
                <Link
                  key={c.id}
                  to={c.to}
                  data-agent={c.id}
                  className={`min-h-[64px] rounded-xl border bg-white/[0.02] p-3 transition-[border-color,box-shadow] duration-300 ${
                    focus === c.id
                      ? 'border-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.12)]'
                      : 'border-white/[0.08] hover:border-accent/40'
                  }`}
                >
                  <span className="block font-display text-lg text-text-primary">{c.title}</span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
                    {c.tag}
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadResume}
                className="min-h-[40px] rounded-full border border-white/[0.1] px-4 text-sm text-text-primary"
              >
                Resume ↓
              </button>
              <a
                href="#contact"
                data-agent="contact"
                className={`inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm text-text-primary transition-colors duration-300 ${
                  focus === 'contact' ? 'border-accent bg-accent/10' : 'border-white/[0.1]'
                }`}
              >
                Get in touch
              </a>
            </div>
            <div
              ref={cursorRef}
              aria-hidden
              className={`pointer-events-none absolute left-0 top-0 z-10 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.6,0,.2,1)] ${
                paused ? 'opacity-25' : 'opacity-100'
              } motion-reduce:hidden`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path
                  d="M4 2l16 9-7 2-3 7z"
                  fill="hsl(var(--accent))"
                  stroke="hsl(var(--bg))"
                  strokeWidth="1.2"
                />
              </svg>
              <span className="absolute left-5 top-4 whitespace-nowrap rounded-md bg-accent px-1.5 py-0.5 font-mono text-[10px] text-bg">
                {paused ? 'waiting' : 'agent'}
              </span>
            </div>
          </div>
          <div
            className="flex h-56 min-w-0 flex-col justify-end overflow-hidden border-t border-white/[0.08] p-4 font-mono text-xs leading-relaxed md:h-auto md:min-h-[340px] md:border-l md:border-t-0"
            aria-hidden
          >
            {log.map((step, i) => (
              <div key={`${i}-${step.text}`} className={`terminal-line ${tone[step.kind]}`}>
                {step.kind}: {step.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
