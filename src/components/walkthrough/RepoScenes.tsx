import type { RepoWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// RepoMind's five scenes: clone, filter, classify, map, reduce.

export function RepoScenes({ d, tokens }: { d: RepoWalkthrough; tokens: Token[] }) {
  const total = d.funnel[0][1];
  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>repomind · clone</span>
          <span>git clone --depth 1</span>
        </div>
        <p className="wt-url">
          <span aria-hidden>⌕</span>
          {d.repoUrl}
        </p>
        <ol className="wt-files">
          {d.sampleFiles.map((f, i) => (
            <li key={f} style={{ ['--i' as string]: i, ['--n' as string]: d.sampleFiles.length }}>
              {f}
            </li>
          ))}
        </ol>
        <p className="wt-files-more" style={{ ['--i' as string]: d.sampleFiles.length, ['--n' as string]: d.sampleFiles.length }}>
          + {total - d.sampleFiles.length} more · {total} files
        </p>
      </div>

      <div className="wt-scene" data-scene="1">
        <div className="wt-scene-label">
          <span>preprocess · filter</span>
          <span>rule-based</span>
        </div>
        <ol className="wt-funnel">
          {d.funnel.map(([what, n], i) => (
            <li
              key={what}
              style={{ ['--i' as string]: i, ['--n' as string]: d.funnel.length, ['--w' as string]: n / total }}
            >
              <span>{what}</span>
              <b>{n}</b>
              <span className="wt-bar">
                <i />
              </span>
            </li>
          ))}
        </ol>
        <p className="wt-chips wt-chips-out">
          {d.ignored.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </p>
        <p className="wt-chips wt-chips-in">
          {d.keptTypes.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </p>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>classifier · {d.model}</span>
          <span>1 of {d.types.length} types</span>
        </div>
        <p className="wt-types">
          {d.types.map((t) => (
            <span key={t} className={t === d.classification ? 'wt-type-on' : undefined}>
              {t}
            </span>
          ))}
        </p>
        <p className="wt-reason">{d.reason}</p>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>map · one file at a time</span>
          <span>
            {d.explained.length} files explained
          </span>
        </div>
        <ol className="wt-mapped">
          {d.explained.map((f, i) => (
            <li key={f.path} className="wt-li" style={{ ['--i' as string]: i }}>
              <code>{f.path}</code>
              <span>{f.gist}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>reduce · one-line summary</span>
          <span className="wt-gen" data-busy="writing" data-done={`${d.seconds} s end to end`} />
        </div>
        <p className="wt-answer">
          <TypedTokens tokens={tokens} />
        </p>
        <p className="wt-sections">
          {d.sections.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </p>
        <div className="wt-stats">
          <span>
            sections <b>{d.sections.length}</b>
          </span>
          <span>
            llm calls <b>{d.calls}</b>
          </span>
          <span>
            groq <b>free tier</b>
          </span>
        </div>
      </div>
    </>
  );
}
