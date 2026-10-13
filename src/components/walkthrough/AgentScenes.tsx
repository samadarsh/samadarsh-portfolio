import type { AgentWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// BiteWise's five scenes: profile, search, rank, explain, confirm.

const MENU = 'get_restaurant_menu';

export function AgentScenes({ d, tokens }: { d: AgentWalkthrough; tokens: Token[] }) {
  const top = d.ranked[0];
  const best = top.score;
  const floor = 50;
  const menuCalls = d.tools.filter((t) => t.call.startsWith(MENU));
  const menuDishes = menuCalls.reduce((n, t) => n + parseInt(t.result, 10), 0);
  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>nutriorder · onboarding</span>
          <span>mifflin-st jeor</span>
        </div>
        <p className="wt-chips">
          {d.profile.inputs.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </p>
        <ol className="wt-math">
          {d.profile.math.map(([what, value], i) => (
            <li
              key={what}
              className={i === d.profile.math.length - 1 ? 'wt-math-final' : undefined}
              style={{ ['--i' as string]: i, ['--n' as string]: d.profile.math.length }}
            >
              <span>{what}</span>
              <b>{value}</b>
            </li>
          ))}
        </ol>
      </div>

      <div className="wt-scene" data-scene="1">
        <div className="wt-scene-label">
          <span>swiggy food mcp · tool calls</span>
          <span>“{d.query}”</span>
        </div>
        <ol className="wt-tools">
          {d.tools.map((t, i) => (
            <li
              key={i}
              className={[
                t.empty ? 'wt-tool-empty' : t.fallback ? 'wt-tool-fallback' : '',
                t.call.startsWith(MENU) ? 'wt-tool-menu' : '',
              ].join(' ')}
              style={{ ['--i' as string]: i, ['--n' as string]: d.tools.length }}
            >
              <code>{t.call}</code>
              <span>{t.result}</span>
              {t.empty ? <em>nothing by that name, so it falls back to restaurants</em> : null}
            </li>
          ))}
          {/* Small screens show the menu reads as one row. */}
          <li
            className="wt-tool-fallback wt-tool-group"
            style={{ ['--i' as string]: d.tools.length - 1, ['--n' as string]: d.tools.length }}
          >
            <code>
              {MENU}(…) × {menuCalls.length}
            </code>
            <span>{menuDishes} dishes</span>
          </li>
        </ol>
        <p className="wt-tools-sum" style={{ ['--i' as string]: d.tools.length, ['--n' as string]: d.tools.length }}>
          {d.toolSummary}
        </p>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>ranking engine · 10 factors</span>
          <span>score / 100</span>
        </div>
        <ol className="wt-hits">
          {d.ranked.map((m, i) => (
            <li
              key={m.name}
              className={`wt-li wt-hit wt-hit-dish${i === 0 ? ' wt-hit-best' : ''}`}
              style={{
                ['--i' as string]: i,
                ['--w' as string]: Math.max(0.04, (m.score - floor) / (best - floor)),
              }}
            >
              <span className="wt-rank">#{i + 1}</span>
              <span className="wt-hit-text wt-dish">
                <b>{m.name}</b>
                <small>
                  {m.protein} g · {m.calories} kcal · Rs {m.price}
                </small>
              </span>
              <span className="wt-score">{m.score.toFixed(1)}</span>
              <span className="wt-bar">
                <i />
              </span>
            </li>
          ))}
        </ol>
        <p className="wt-note">{d.otherRuns}</p>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>{top.name}</span>
          <span className="wt-gen" data-busy="explaining" data-done="from the scores" />
        </div>
        <p className="wt-answer">
          <TypedTokens tokens={tokens} />
        </p>
        <p className="wt-tradeoff">
          <span aria-hidden>!</span>
          {d.tradeoff}
        </p>
        <ul className="wt-factors">
          {d.factors.map((f) => (
            <li key={f.name} style={{ ['--s' as string]: f.score }}>
              <span>
                {f.name} <small>×{f.weight.toFixed(2)}</small>
              </span>
              <span className="wt-bar">
                <i />
              </span>
              <b>{f.score.toFixed(2)}</b>
            </li>
          ))}
        </ul>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>order state machine</span>
          <span>every transition recorded</span>
        </div>
        <p className="wt-earlier">
          {d.earlierStates.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
        <ol className="wt-flow">
          {d.flow.map((f, i) => (
            <li
              key={f.state}
              className={f.refused ? 'wt-flow-refused' : undefined}
              style={{ ['--i' as string]: i, ['--n' as string]: d.flow.length }}
            >
              <code>{f.refused ? `✕ ${f.state}` : f.state}</code>
              {f.detail ? <span>{f.detail}</span> : null}
            </li>
          ))}
        </ol>
        <div className="wt-cap-run" style={{ ['--i' as string]: d.flow.length, ['--n' as string]: d.flow.length }}>
          <span className="wt-rate-label">{d.capRun.cart}</span>
          <p>
            <code>✕ {d.capRun.state}</code> <span className="wt-cap-full">{d.capRun.refusal}</span>
            <span className="wt-cap-short">{d.capRun.short}</span>
          </p>
        </div>
      </div>
    </>
  );
}
