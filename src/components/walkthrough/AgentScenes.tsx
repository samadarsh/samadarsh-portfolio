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
              {t.empty ? <em>no exact match, so it widens the search</em> : null}
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
          <span>match</span>
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
              <span className="wt-score">{Math.round(m.score)}%</span>
              <span className="wt-bar">
                <i />
              </span>
            </li>
          ))}
        </ol>
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
          <span aria-hidden>i</span>
          {d.tradeoff}
        </p>
        <p className="wt-factors-label">
          top {d.factors.length} factors · {Math.round(d.factors.reduce((n, f) => n + f.weight, 0) * 100)}% of the weight
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
            <li key={f.state} style={{ ['--i' as string]: i, ['--n' as string]: d.flow.length }}>
              <code>{f.state}</code>
              <span>{f.detail}</span>
            </li>
          ))}
        </ol>
        <div className="wt-guards" style={{ ['--i' as string]: d.flow.length, ['--n' as string]: d.flow.length }}>
          <span className="wt-rate-label">guardrails · tested in this run</span>
          {d.guardrails.map((g) => (
            <p key={g.name}>
              <span className="wt-shield" aria-hidden>
                <svg viewBox="0 0 16 16" width="14" height="14">
                  <path d="M8 1.5 2.5 3.5v4c0 3.3 2.3 5.9 5.5 7 3.2-1.1 5.5-3.7 5.5-7v-4z" />
                  <path d="m5.5 8 1.8 1.8L10.8 6.3" />
                </svg>
              </span>
              <b>{g.name}</b>
              <span className="wt-guard-detail">{g.detail}</span>
              <em>held</em>
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
