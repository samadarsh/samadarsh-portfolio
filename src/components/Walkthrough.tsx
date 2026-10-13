import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { typedText, type Walkthrough as WalkthroughData } from '../data/walkthrough';
import { getLenis } from '../lib/smoothScroll';
import { AgentScenes } from './walkthrough/AgentScenes';
import { RagScenes } from './walkthrough/RagScenes';
import { RepoScenes } from './walkthrough/RepoScenes';
import { SpeechScenes } from './walkthrough/SpeechScenes';
import { tokenize, type Token } from './walkthrough/tokens';

/**
 * A pinned, scroll-driven walkthrough of one real input through a project, in the manner of
 * Apple's product pages: the stage stays pinned while scrolling moves it through five steps.
 * One passive scroll listener, throttled to a frame, writes the progress as CSS variables and
 * data attributes on the root; CSS does the drawing. Each project supplies its own scenes
 * (walkthrough/*Scenes.tsx); captions, timing and data come from data/walkthrough.ts. Under
 * reduced motion the same content is laid out as a plain sequence instead.
 */

const N = 5;
/** Share of the typing step's scroll that types the text out; the rest holds the result. */
const TYPE_SHARE = 0.65;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function Scenes({ d, tokens }: { d: WalkthroughData; tokens: Token[] }) {
  if (d.kind === 'rag') return <RagScenes d={d} tokens={tokens} />;
  if (d.kind === 'speech') return <SpeechScenes d={d} tokens={tokens} />;
  if (d.kind === 'repo') return <RepoScenes d={d} tokens={tokens} />;
  return <AgentScenes d={d} tokens={tokens} />;
}

/**
 * Plays a clip. While it plays, its progress drives --wave on the registered elements (and
 * data-playing is set, so scrolling leaves --wave alone); when it stops, --wave returns to the
 * scroll position in --scrub. Combining the two here keeps max() out of the CSS, which sent
 * WebKit into a constant restyle when the bars carried transitions.
 */
function useClip(src: string | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const targets = useRef(new Set<HTMLElement>());
  const [playing, setPlaying] = useState(false);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    [],
  );

  const toggle = useCallback(() => {
    if (!src) return;
    let a = audioRef.current;
    if (!a) {
      a = new Audio(asset(src));
      a.preload = 'auto';
      audioRef.current = a;
      const write = (v: number) =>
        targets.current.forEach((el) => el.style.setProperty('--wave', v.toFixed(4)));
      const stop = () => {
        setPlaying(false);
        targets.current.forEach((el) => {
          el.removeAttribute('data-playing');
          el.style.setProperty('--wave', el.style.getPropertyValue('--scrub') || '1');
        });
      };
      let frame = 0;
      const tick = () => {
        const cur = audioRef.current;
        if (!cur || cur.paused) return;
        write(cur.duration ? cur.currentTime / cur.duration : 0);
        frame = requestAnimationFrame(tick);
      };
      a.addEventListener('play', () => {
        setPlaying(true);
        targets.current.forEach((el) => el.setAttribute('data-playing', ''));
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      });
      a.addEventListener('pause', stop);
      a.addEventListener('ended', stop);
    }
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [src]);

  const register = useCallback((el: HTMLElement | null) => {
    if (el) targets.current.add(el);
  }, []);

  return { playing, toggle, register };
}

function PlayButton({ playing, onClick, seconds }: { playing: boolean; onClick: () => void; seconds: number }) {
  return (
    <button type="button" className="wt-play" aria-pressed={playing} onClick={onClick}>
      <span className="wt-play-icon" aria-hidden>
        {playing ? '❚❚' : '▶'}
      </span>
      {playing ? 'Pause the clip' : `Play the clip (${Math.round(seconds)} s)`}
    </button>
  );
}

/** The same five steps as a plain sequence, for reduced motion. */
function StaticWalkthrough({
  d,
  tokens,
  clip,
}: {
  d: WalkthroughData;
  tokens: Token[];
  clip: ReturnType<typeof useClip>;
}) {
  return (
    <ol className="wt-static">
      {d.steps.map((c, i) => (
        <li key={i} className="wt-static-step" data-step={i}>
          <div>
            <span className="wt-num">
              {String(i + 1).padStart(2, '0')} · {c.label}
            </span>
            <h3 className="wt-title">{c.title}</h3>
            <p className="wt-body">{c.body}</p>
            {i === d.typeStep ? (
              <p className="wt-body">{tokens.map((t) => t.text).join('')}</p>
            ) : null}
            {i === 0 && d.kind === 'speech' ? (
              <PlayButton playing={clip.playing} onClick={clip.toggle} seconds={d.audio.seconds} />
            ) : null}
          </div>
          <div
            ref={i === 0 ? clip.register : undefined}
            className="wt-stage wt-stage-static"
            data-step={i}
            data-typed=""
            aria-hidden="true"
            style={{
              ['--hits' as string]: 99,
              ['--wt-l' as string]: 1,
              ['--scrub' as string]: 1,
              ['--wave' as string]: 1,
            }}
          >
            <Scenes d={d} tokens={tokens} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Walkthrough({ data: d }: { data: WalkthroughData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const typed = typedText(d);
  const tokens = useMemo(() => tokenize(typed), [typed]);
  const plainTyped = useMemo(() => typed.replace(/\[\[(p\.\d+)\]\]/g, '$1'), [typed]);
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [step, setStep] = useState(0);
  const clip = useClip(d.kind === 'speech' ? d.audio.src : undefined);
  const { register } = clip;
  const latency = d.kind === 'rag' || d.kind === 'speech' ? d.latencySeconds : null;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (reduced || !root) return;
    register(root);
    const toks = [...root.querySelectorAll<HTMLElement>('.wt-tok')];
    const listLen = root.querySelectorAll(`[data-scene="${d.listStep}"] .wt-li`).length;
    const gen = root.querySelector<HTMLElement>(`[data-scene="${d.typeStep}"] .wt-gen`);
    // Scenes can name the typing's two states; the default fits a model writing an answer.
    const busy = gen?.dataset.busy ?? 'generating';
    const doneLabel = gen?.dataset.done ?? `${latency} s`;
    let shown = -1;
    let current = -1;
    let frame = 0;

    const update = () => {
      frame = 0;
      const r = root.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(Math.max(-r.top / total, 0), 1);
      const pos = Math.min(p * N, N - 0.0001);
      const s = Math.floor(pos);
      const local = pos - s;
      root.style.setProperty('--wt-p', p.toFixed(4));
      root.style.setProperty('--wt-l', local.toFixed(4));
      const scrub = (s === 0 ? local : 1).toFixed(4);
      root.style.setProperty('--scrub', scrub);
      if (!root.hasAttribute('data-playing')) root.style.setProperty('--wave', scrub);
      if (s !== current) {
        current = s;
        root.dataset.step = String(s);
        setStep(s);
      }
      const hits =
        s < d.listStep ? 0 : s > d.listStep ? listLen : Math.min(listLen, Math.floor(local * (listLen + 2)));
      root.style.setProperty('--hits', String(hits));
      // The text types out with the scroll, and un-types when scrolling back.
      const t = s < d.typeStep ? 0 : s > d.typeStep ? 1 : Math.min(1, local / TYPE_SHARE);
      const count = Math.round(t * toks.length);
      if (count !== shown) {
        const lo = Math.min(count, Math.max(shown, 0));
        const hi = Math.max(count, shown);
        for (let i = lo; i < hi; i++) toks[i].classList.toggle('on', i < count);
        shown = count;
        const done = count === toks.length && toks.length > 0;
        root.toggleAttribute('data-typed', done);
        if (gen)
          gen.textContent = done ? `done · ${doneLabel}` : `${busy} · ${Math.round(t * 100)}%`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [reduced, d.listStep, d.typeStep, latency, register]);

  /** Scrolls to a step, the way Apple's dot navigation jumps between scenes. */
  const goTo = (i: number) => {
    const root = rootRef.current;
    if (!root) return;
    const total = root.offsetHeight - window.innerHeight;
    // The typing step lands past the typing, so its text is shown complete.
    const within = i === d.typeStep ? 0.85 : 0.45;
    const top = window.scrollY + root.getBoundingClientRect().top + ((i + within) / N) * total;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: 1.1 });
    else window.scrollTo({ top, behavior: 'smooth' });
  };

  if (reduced) return <StaticWalkthrough d={d} tokens={tokens} clip={clip} />;

  return (
    <div ref={rootRef} className="wt" data-step="0" data-kind={d.kind}>
      <div className="wt-pin">
        <nav className="wt-rail" aria-label="Walkthrough steps">
          {d.steps.map(({ label }, i) => (
            <button
              key={label}
              type="button"
              className="wt-rail-step"
              style={{ ['--i' as string]: i }}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => goTo(i)}
            >
              <span className="wt-rail-bar">
                <i />
              </span>
              <span className="wt-rail-label">
                <span className="wt-rail-n">{String(i + 1).padStart(2, '0')}</span> {label}
              </span>
            </button>
          ))}
        </nav>

        <div className="wt-body-grid">
          <div className="wt-captions">
            {d.steps.map((c, i) => (
              <div key={i} className="wt-cap" data-cap={i}>
                <span className="wt-num">
                  {String(i + 1).padStart(2, '0')} · {c.label}
                </span>
                <h3 className="wt-title">{c.title}</h3>
                <p className="wt-body">{c.body}</p>
                <p className="wt-facts">
                  {c.facts.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </p>
                {i === 0 && d.kind === 'speech' ? (
                  <PlayButton playing={clip.playing} onClick={clip.toggle} seconds={d.audio.seconds} />
                ) : null}
                {i === d.typeStep ? <p className="sr-only">{plainTyped}</p> : null}
              </div>
            ))}
          </div>

          <div className="wt-stage" aria-hidden="true">
            <Scenes d={d} tokens={tokens} />
          </div>
        </div>
      </div>
    </div>
  );
}
