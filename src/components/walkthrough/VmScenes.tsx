import type { VmWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// clox's five scenes: the REPL, compile, run (stepped like the playground's debugger), objects,
// and a runtime error.

/** Source code with its line numbers; `marks` are the lines to point at. */
function Code({ lines, marks = [], tight }: { lines: string[]; marks?: number[]; tight?: boolean }) {
  return (
    <ol className={tight ? 'wt-code wt-code-tight' : 'wt-code'}>
      {lines.map((line, i) => (
        <li key={i} className={marks.includes(i + 1) ? 'wt-code-mark' : undefined}>
          <span aria-hidden>{i + 1}</span>
          <code>{line || ' '}</code>
        </li>
      ))}
    </ol>
  );
}

/** The function a call frame belongs to, from the closure in its first slot: `<fn square>`. */
const frameName = (slot: string | undefined) => slot?.match(/^<fn (.+)>$/)?.[1] ?? 'fn';

export function VmScenes({ d, tokens }: { d: VmWalkthrough; tokens: Token[] }) {
  const n = d.run.length;
  let printed: string | undefined;
  const states = d.run.map((s) => {
    printed = s.out ?? printed;
    return { ...s, printed };
  });
  // Reduced motion shows one state: the last one inside the call.
  const key = d.run.reduce((last, s, i) => (s.frame > 0 ? i : last), 0);
  const listed = d.compile.chunks.flatMap((c) => c.code).length;
  let k = 0;
  const marks = d.error.lines.flatMap((l) => {
    const m = l.match(/^\[line (\d+)\]/);
    return m ? [Number(m[1])] : [];
  });

  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>clox · REPL</span>
          <span>one line at a time</span>
        </div>
        <p className="wt-url">
          <span aria-hidden>$</span>
          {d.repl.command}
        </p>
        <ol className="wt-repl">
          {d.repl.lines.map((l, i) => (
            <li
              key={i}
              className={l.out ? 'wt-repl-out' : undefined}
              style={{ ['--i' as string]: i, ['--n' as string]: d.repl.lines.length }}
            >
              {l.in ?? l.out}
            </li>
          ))}
        </ol>
        <p className="wt-chips">
          {d.traits.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </p>
      </div>

      <div className="wt-scene" data-scene="1">
        <div className="wt-scene-label">
          <span>make trace · bytecode</span>
          <span>
            {d.compile.chunks.length} chunks · {listed} instructions
          </span>
        </div>
        <Code lines={d.compile.source} />
        <div className="wt-chunks">
          {d.compile.chunks.map((c) => (
            <div key={c.name} className="wt-chunk-code">
              <p className="wt-wire-label">== {c.name} ==</p>
              <ol>
                {c.code.map(([at, line, op, arg]) => (
                  <li key={at} className="wt-li" style={{ ['--i' as string]: k++ }}>
                    <span>{at}</span>
                    <span>{line}</span>
                    <b>{op}</b>
                    <i>{arg}</i>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
        <p className="wt-note">{d.compile.note}</p>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>stack after each instruction</span>
          <span>scroll to step</span>
        </div>
        <div className="wt-tt" style={{ ['--n' as string]: n }}>
          {states.map((s, i) => (
            <div
              key={i}
              className="wt-tt-state"
              data-key={i === key ? '' : undefined}
              style={{ ['--k' as string]: i }}
            >
              <p className="wt-tt-op">
                <span>
                  {String(i + 1).padStart(2, '0')} / {n}
                </span>
                <code>{s.fn}</code>
                <b>
                  {s.at} {s.op}
                </b>
              </p>
              {s.stack.length ? (
                <ol className="wt-stack">
                  {s.stack.map((v, j) => (
                    <li
                      key={j}
                      className={
                        [s.frame > 0 && j >= s.frame ? 'wt-in-frame' : '', j === s.stack.length - 1 ? 'wt-top' : '']
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                    >
                      <small>{j}</small>
                      {v}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="wt-stack-done">the script returns, and the run is over</p>
              )}
              <p className="wt-tt-meta">
                <span>frame: {s.frame > 0 ? `${frameName(s.stack[s.frame])}(), from slot ${s.frame}` : 'script'}</span>
                <span>
                  stdout: <b>{s.printed ?? '—'}</b>
                </span>
              </p>
            </div>
          ))}
          <div className="wt-tt-bar" aria-hidden>
            <i />
          </div>
          <ol className="wt-tt-list">
            {d.run.map((s, i) => (
              <li key={i} className={s.fn !== 'script' ? 'wt-tt-call' : undefined} style={{ ['--k' as string]: i }}>
                <span>{s.at}</span>
                <code>{s.op}</code>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>{d.objects.file}</span>
          <span
            className="wt-gen"
            data-busy="running"
            data-done={`${d.objects.output.split('\n').length} lines printed`}
          />
        </div>
        <Code lines={d.objects.source} tight />
        <p className="wt-answer wt-out">
          <TypedTokens tokens={tokens} />
        </p>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>{d.error.command.split(' ').pop()}</span>
          <span>exit code {d.error.exitCode}</span>
        </div>
        <Code lines={d.error.source} marks={marks} />
        <p className="wt-url wt-vm-cmd">
          <span aria-hidden>$</span>
          {d.error.command}
        </p>
        <ol className="wt-repl wt-trace">
          {[...d.error.lines, `exit code ${d.error.exitCode}`].map((l, i, all) => (
            <li key={l} style={{ ['--i' as string]: i, ['--n' as string]: all.length }}>
              {l}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
