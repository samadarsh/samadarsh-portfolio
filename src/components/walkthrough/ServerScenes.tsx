import type { ServerWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// redis-go's five scenes: start, speak RESP, store, stop, recover.

/** A command as RESP puts it on the wire: an array of length-prefixed bulk strings. */
function Resp({ command }: { command: string }) {
  const args = command.split(' ');
  const crlf = <i>\r\n</i>;
  return (
    <pre className="wt-wire">
      <b>*{args.length}</b>
      {crlf}
      {args.map((a, i) => (
        <span key={i}>
          <b>${new TextEncoder().encode(a).length}</b>
          {crlf}
          {a}
          {crlf}
        </span>
      ))}
    </pre>
  );
}

/** A reply as RESP puts it on the wire: OK as a simple string, a quoted value as a bulk string. */
const respReply = (reply: string) => {
  const bulk = reply.match(/^"(.*)"$/);
  return bulk ? [`$${new TextEncoder().encode(bulk[1]).length}`, bulk[1]] : [`+${reply}`];
};

export function ServerScenes({ d, tokens }: { d: ServerWalkthrough; tokens: Token[] }) {
  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>redis-go · start</span>
          <span>persistence on</span>
        </div>
        <p className="wt-url">
          <span aria-hidden>$</span>
          {d.start.command}
        </p>
        <ol className="wt-files">
          {d.start.logs.map(([msg, detail], i) => (
            <li key={msg} style={{ ['--i' as string]: i, ['--n' as string]: d.start.logs.length }}>
              {msg} · {detail}
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
          <span>redis-cli → redis-go</span>
          <span>RESP over TCP</span>
        </div>
        <p className="wt-url">
          <span aria-hidden>$</span>
          redis-cli -p 6380 {d.wire.command}
        </p>
        <p className="wt-wire-label">sent</p>
        <Resp command={d.wire.command} />
        <p className="wt-wire-label">replies</p>
        <ul className="wt-kv wt-replies">
          {d.wire.replies.map(([cmd, reply]) => (
            <li key={cmd}>
              <code>{cmd}</code>
              <b>{reply}</b>
              <span className="wt-wire-inline">
                {respReply(reply).map((part, i) => (
                  <span key={i}>
                    {part}
                    <i>\r\n</i>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>store · thread-safe map</span>
          <span>KEYS * → {d.keys.length}</span>
        </div>
        <ul className="wt-kv">
          {d.keys.map(([key, value, note]) => (
            <li key={key}>
              <code>{key}</code>
              <b>{value}</b>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>append-only file</span>
          <span>{d.aof.length} writes</span>
        </div>
        <ol className="wt-mapped">
          {d.aof.map((w, i) => (
            <li key={i} className="wt-li" style={{ ['--i' as string]: i }}>
              <code>{w.command}</code>
              <span>{w.gist}</span>
            </li>
          ))}
        </ol>
        <ol className="wt-flow">
          {d.shutdown.map((s) => (
            <li key={s.state}>
              <code>{s.state}</code>
              <span>{s.detail}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>restart · AOF replay</span>
          <span
            className="wt-gen"
            data-busy="replaying"
            data-done={`${d.replay.commands} commands in ${d.replay.micros} µs`}
          />
        </div>
        <p className="wt-url">
          <span aria-hidden>▸</span>
          AOF loaded · {d.replay.commands} commands · {d.replay.micros} µs
        </p>
        <p className="wt-answer">
          <TypedTokens tokens={tokens} />
        </p>
        <ul className="wt-kv wt-survived">
          {d.survived.map(([key, before, after]) => (
            <li key={key}>
              <code>{key}</code>
              <b>{after}</b>
              <span>
                before the stop: {before} · after the restart: {after}
              </span>
            </li>
          ))}
        </ul>
        <div className="wt-stats">
          <span>
            replayed <b>{d.replay.commands}</b>
          </span>
          <span>
            took <b>{d.replay.micros} µs</b>
          </span>
          <span>
            down <b>{d.replay.downSeconds} s</b>
          </span>
        </div>
      </div>
    </>
  );
}
