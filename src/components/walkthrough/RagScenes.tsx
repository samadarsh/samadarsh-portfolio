import type { RagWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// FinSight's five scenes: ask, parse, chunk + embed, retrieve, answer + cite.

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

export function RagScenes({ d, tokens }: { d: RagWalkthrough; tokens: Token[] }) {
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
          <code>{d.chunkNote.code}</code> {d.chunkNote.text}
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
              className={`wt-li wt-hit${i === 0 ? ' wt-hit-best' : ''}`}
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
          <TypedTokens tokens={tokens} />
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
