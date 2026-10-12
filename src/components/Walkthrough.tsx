import { useEffect, useMemo, useRef, useState } from 'react';
import type { Walkthrough as WalkthroughData } from '../data/walkthrough';
import { getLenis } from '../lib/smoothScroll';

/**
 * A pinned, scroll-driven walkthrough of one real question through a project, in the manner of
 * Apple's product pages: the stage stays pinned while scrolling moves it through five steps.
 * One passive scroll listener, throttled to a frame, writes the progress as CSS variables and
 * data attributes on the root; CSS does the drawing. Under reduced motion the same content is
 * laid out as a plain sequence instead.
 */

const STEPS = ['Ask', 'Parse', 'Chunk + embed', 'Retrieve', 'Answer + cite'] as const;
const N = STEPS.length;
/** Share of the last step's scroll that types out the answer; the rest holds the cited result. */
const TYPE_SHARE = 0.65;

type Token = { kind: 'word'; text: string } | { kind: 'cite'; text: string };

/** Splits an answer into words and [[p.N]] citation chips, keeping the spacing. */
function tokenize(answer: string): Token[] {
  const out: Token[] = [];
  for (const part of answer.split(/(\[\[p\.\d+\]\])/)) {
    if (!part) continue;
    const cite = part.match(/^\[\[(p\.\d+)\]\]$/);
    if (cite) out.push({ kind: 'cite', text: cite[1] });
    else for (const w of part.match(/\S+\s*|\s+/g) ?? []) out.push({ kind: 'word', text: w });
  }
  return out;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function captions(d: WalkthroughData) {
  return [
    {
      title: 'A question an analyst would ask.',
      body: `Not "what was the margin", but what drove it and what held it back. The answer sits in one paragraph of a ${d.document.pages}-page report.`,
      facts: [`company = ${d.company}`],
    },
    {
      title: 'Every page, read as text.',
      body: 'PyMuPDF reads the PDF page by page and keeps each page number, so any answer can point back to where it came from.',
      facts: [`${d.document.pages} pages`, d.document.file],
    },
    {
      title: 'Pages become searchable meaning.',
      body: `Each page is split into ${d.chunking.size.toLocaleString('en-IN')}-character chunks that overlap by ${d.chunking.overlap}, and each chunk becomes a ${d.chunking.dims}-number vector from a local embedding model. No API calls, no cost.`,
      facts: [
        `${d.chunking.companyChunks.toLocaleString('en-IN')} ${d.company} chunks`,
        `${d.chunking.totalChunks.toLocaleString('en-IN')} in the index`,
      ],
    },
    {
      title: 'The right page comes first.',
      body: `The question becomes a vector too. ChromaDB returns the five closest chunks, filtered to ${d.company}. Page ${d.document.page}, where the answer lives, ranks first.`,
      facts: [`top 5 of ${d.chunking.companyChunks.toLocaleString('en-IN')}`, 'rank 1 = answer page'],
    },
    {
      title: 'An answer you can check.',
      body: `${d.model.split(' · ')[0]} answers only from those five chunks and cites the page for each claim. The sentence it relied on is right there on p.${d.document.page}.`,
      facts: [`${d.latencySeconds} s, run locally`, '₹0 per question'],
    },
  ];
}

/** Deterministic bar heights, so the "vector" looks the same on every visit. */
function vectorBars(seed: number, count = 48) {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(0.18 + (s / 233280) * 0.82);
  }
  return out;
}

function Scenes({ d, tokens }: { d: WalkthroughData; tokens: Token[] }) {
  const top = d.hits[0].score;
  const floor = 0.6;
  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>finsight · ask</span>
          <span>company = {d.company}</span>
        </div>
        <p className="wt-question">{d.question}</p>
      </div>

      <div className="wt-scene" data-scene="1">
        <div className="wt-scene-label">
          <span>{d.document.file}</span>
          <span>
            page {d.document.page} of {d.document.pages}
          </span>
        </div>
        <div className="wt-pages">
          <span className="wt-sheet" style={{ ['--k' as string]: 0 }} />
          <span className="wt-sheet" style={{ ['--k' as string]: 1 }} />
          <span className="wt-sheet" style={{ ['--k' as string]: 2 }} />
          <div className="wt-sheet wt-sheet-hit">
            <span className="wt-pg">
              p.{d.document.page} · {d.document.section}
            </span>
            <span className="wt-ln" style={{ width: '92%' }} />
            <span className="wt-ln" style={{ width: '78%' }} />
            <span className="wt-ln" style={{ width: '86%' }} />
            <span className="wt-hl">{d.document.highlight}</span>
            <span className="wt-ln" style={{ width: '88%' }} />
            <span className="wt-ln" style={{ width: '70%' }} />
            <span className="wt-ln" style={{ width: '82%' }} />
          </div>
        </div>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>chunks from p.{d.document.page}</span>
          <span>
            {d.chunking.model.split('/').pop()} · {d.chunking.dims} dims
          </span>
        </div>
        <div className="wt-chunk">
          <p>
            {d.chunk.before}
            <mark>{d.chunk.answer}</mark>
            {d.chunk.after}
          </p>
          <span className="wt-vec">
            {vectorBars(24).map((h, i) => (
              <i key={i} style={{ ['--h' as string]: h, ['--d' as string]: (i / 48) * 0.6 }} />
            ))}
          </span>
        </div>
        <div className="wt-chunk wt-chunk-dim">
          <p>{d.neighbour}</p>
          <span className="wt-vec">
            {vectorBars(58).map((h, i) => (
              <i key={i} style={{ ['--h' as string]: h, ['--d' as string]: 0.2 + (i / 48) * 0.6 }} />
            ))}
          </span>
        </div>
        <p className="wt-note">
          <code>{d.extractionNote.found}</code> {d.extractionNote.text}
        </p>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>chroma · top 5 · company = {d.company}</span>
          <span>similarity</span>
        </div>
        <ol className="wt-hits">
          {d.hits.map((h, i) => (
            <li
              key={i}
              className={`wt-hit${i === 0 ? ' wt-hit-best' : ''}`}
              style={{
                ['--i' as string]: i,
                ['--w' as string]: Math.max(0.04, (h.score - floor) / (top - floor)),
              }}
            >
              <span className="wt-rank">#{i + 1}</span>
              <span className="wt-hit-text">
                <b>p.{h.page}</b>
                {h.text}
              </span>
              <span className="wt-score">{h.score.toFixed(3)}</span>
              <span className="wt-bar">
                <i />
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>{d.model.toLowerCase()} · local</span>
          <span className="wt-gen" />
        </div>
        <p className="wt-answer">
          {tokens.map((t, i) =>
            t.kind === 'cite' ? (
              <span key={i} className="wt-tok wt-cite">
                {t.text}
              </span>
            ) : (
              <span key={i} className="wt-tok">
                {t.text}
              </span>
            ),
          )}
        </p>
        <div className="wt-source">
          <span className="wt-pg">
            {d.document.file} · p.{d.document.page}
          </span>
          <p>
            <mark>{d.source.mark}</mark>
            <span className="wt-source-rest">{d.source.rest}</span>
          </p>
        </div>
        <div className="wt-stats">
          <span>
            latency <b>{d.latencySeconds} s</b>
          </span>
          <span>
            cited <b>p.{d.document.page}</b>
          </span>
          <span>
            answer page rank <b>1</b>
          </span>
        </div>
      </div>
    </>
  );
}

/** The same five steps as a plain sequence, for reduced motion. */
function StaticWalkthrough({ d, tokens }: { d: WalkthroughData; tokens: Token[] }) {
  const caps = captions(d);
  return (
    <ol className="wt-static">
      {caps.map((c, i) => (
        <li key={i} className="wt-static-step" data-step={i}>
          <div>
            <span className="wt-num">
              {String(i + 1).padStart(2, '0')} · {STEPS[i]}
            </span>
            <h3 className="wt-title">{c.title}</h3>
            <p className="wt-body">{c.body}</p>
            {i === N - 1 ? <p className="wt-body">Answer: {tokens.map((t) => t.text).join('')}</p> : null}
          </div>
          <div
            className="wt-stage wt-stage-static"
            data-step={i}
            data-cited=""
            aria-hidden="true"
            style={{ ['--hits' as string]: N, ['--wt-l' as string]: 1 }}
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
  const tokens = useMemo(() => tokenize(d.answer), [d.answer]);
  const caps = useMemo(() => captions(d), [d]);
  const plainAnswer = useMemo(() => d.answer.replace(/\[\[(p\.\d+)\]\]/g, '$1'), [d.answer]);
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (reduced || !root) return;
    const toks = [...root.querySelectorAll<HTMLElement>('.wt-tok')];
    const gen = root.querySelector<HTMLElement>('.wt-gen');
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
      if (s !== current) {
        current = s;
        root.dataset.step = String(s);
        setStep(s);
      }
      root.style.setProperty('--hits', String(s < 3 ? 0 : s > 3 ? N : Math.min(N, Math.floor(local * 7))));
      // The answer types out with the scroll, and un-types when scrolling back.
      const typed = s < 4 ? 0 : Math.min(1, local / TYPE_SHARE);
      const count = Math.round(typed * toks.length);
      if (count !== shown) {
        const lo = Math.min(count, Math.max(shown, 0));
        const hi = Math.max(count, shown);
        for (let i = lo; i < hi; i++) toks[i].classList.toggle('on', i < count);
        shown = count;
        root.toggleAttribute('data-cited', count === toks.length && toks.length > 0);
        if (gen)
          gen.textContent =
            count === toks.length ? `done · ${d.latencySeconds} s` : `generating · ${Math.round(typed * 100)}%`;
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
  }, [reduced, d.latencySeconds]);

  /** Scrolls to the middle of a step, the way Apple's dot navigation jumps between scenes. */
  const goTo = (i: number) => {
    const root = rootRef.current;
    if (!root) return;
    const total = root.offsetHeight - window.innerHeight;
    // The last step lands past the typing, so the cited answer is shown complete.
    const within = i === N - 1 ? 0.85 : 0.45;
    const top = window.scrollY + root.getBoundingClientRect().top + ((i + within) / N) * total;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: 1.1 });
    else window.scrollTo({ top, behavior: 'smooth' });
  };

  if (reduced) return <StaticWalkthrough d={d} tokens={tokens} />;

  return (
    <div ref={rootRef} className="wt" data-step="0">
      <div className="wt-pin">
        <nav className="wt-rail" aria-label="Walkthrough steps">
          {STEPS.map((label, i) => (
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
            {caps.map((c, i) => (
              <div key={i} className="wt-cap" data-cap={i}>
                <span className="wt-num">
                  {String(i + 1).padStart(2, '0')} · {STEPS[i]}
                </span>
                <h3 className="wt-title">{c.title}</h3>
                <p className="wt-body">{c.body}</p>
                <p className="wt-facts">
                  {c.facts.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </p>
                {i === N - 1 ? <p className="sr-only">Answer: {plainAnswer}</p> : null}
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
