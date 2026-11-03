import type { ReactNode } from 'react';
import type { OpenSourceFixId } from '../data/content';

/**
 * Small drawings of each open-source fix, as frames. The frames up to `bad` tell the bug
 * (played in order when a fix is picked); the last frame is the fixed state. Everything is
 * drawn from the commit's own numbers: the mask values, the rupee amounts, the byte offsets.
 */

type Figure = { frames: (() => ReactNode)[]; bad: number };

const Cells = ({ v, tone }: { v: string; tone?: 'bad' | 'good' }) => (
  <div className="osf-cells">
    {Array.from({ length: 6 }, (_, i) => (
      <span key={i} className={`osf-cell ${tone ? `is-${tone}` : ''}`}>
        {v}
      </span>
    ))}
  </div>
);

const NavBar = ({ width }: { width: number }) => (
  <div className="osf-nav">
    <div className="osf-items" style={{ width: `${width}%` }}>
      {Array.from({ length: 11 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  </div>
);

const Lane = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="osf-lane">
    <span>{label}</span>
    {children}
  </div>
);

const Bar = ({ to }: { to: number }) => (
  <div className="osf-bar">
    <i style={{ width: `${to}%` }} />
  </div>
);

const Bytes = ({ on, bad }: { on?: number[]; bad?: number[] }) => (
  <div className="osf-bytes">
    {['price', '44–48', '…', '60–64'].map((b, i) => (
      <span key={b} className={bad?.includes(i) ? 'is-bad' : on?.includes(i) ? 'is-on' : ''}>
        {b}
      </span>
    ))}
  </div>
);

export const FIGURES: Record<OpenSourceFixId, Figure> = {
  kv: {
    bad: 2,
    frames: [
      () => (
        <>
          <p className="osf-cap">routing mask · bfloat16 cache</p>
          <Cells v="−1e9" />
          <p>adapter routing: correct</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">same mask · float16 cache</p>
          <Cells v="−inf" tone="bad" />
          <p>the mask overflows</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">0 × −inf</p>
          <Cells v="NaN" tone="bad" />
          <p className="is-bad">wrong adapter, output still looks fine</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">startup check</p>
          <Cells v="−1e9" tone="good" />
          <p className="osf-chip is-good">float16 / fp8 cache refused, flag named</p>
        </>
      ),
    ],
  },
  cash: {
    bad: 2,
    frames: [
      () => (
        <>
          <p className="osf-cap">available cash</p>
          <p className="osf-big">₹1,040</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">available cash</p>
          <p className="osf-big">₹1,040</p>
          <p className="osf-chip">+ ₹3,00,000 deposited today</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">available cash</p>
          <p className="osf-big is-bad">₹1,040</p>
          <p className="osf-chip is-bad">today’s deposit not counted</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">available cash</p>
          <p className="osf-big is-good">₹3,01,040</p>
          <p className="osf-chip is-good">pay-in counted</p>
        </>
      ),
    ],
  },
  feed: {
    bad: 2,
    frames: [
      () => (
        <>
          <Lane label="thread A">
            <span className="osf-chip">place → subscribe</span>
          </Lane>
          <Lane label="thread B">
            <span className="osf-chip">cancel → unsubscribe</span>
          </Lane>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">feed queue</p>
          <div className="osf-row">
            <span className="osf-cell is-bad">unsubscribe</span>
            <span className="osf-cell is-bad">subscribe</span>
          </div>
          <p>calls queued in the wrong order</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">result</p>
          <p className="osf-chip is-bad">subscribed · nothing watching</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">feed queue · lock order</p>
          <div className="osf-row">
            <span className="osf-cell is-good">subscribe</span>
            <span className="osf-cell is-good">unsubscribe</span>
          </div>
          <p className="osf-chip is-good">clean unsubscribe</p>
        </>
      ),
    ],
  },
  ticks: {
    bad: 2,
    frames: [
      () => (
        <>
          <p className="osf-cap">Kite full packet · bytes</p>
          <Bytes />
          <p>last-trade time = ?</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">Kite full packet · bytes</p>
          <Bytes bad={[3]} />
          <p className="is-bad">last-trade time = exchange packet time</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">Kite full packet · bytes</p>
          <Bytes bad={[1, 3]} />
          <p className="is-bad">trade time read as a price change ÷ 100</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">Kite full packet · bytes</p>
          <Bytes on={[1]} />
          <p className="is-good">last-trade time from bytes 44–48 · exchange time kept</p>
        </>
      ),
    ],
  },
  contract: {
    bad: 2,
    frames: [
      () => (
        <>
          <Lane label="download">
            <Bar to={35} />
          </Lane>
          <Lane label="login">
            <span>waiting</span>
          </Lane>
        </>
      ),
      () => (
        <>
          <Lane label="download">
            <Bar to={60} />
          </Lane>
          <Lane label="login">
            <span className="osf-chip">loads the saved contract</span>
          </Lane>
        </>
      ),
      () => (
        <>
          <Lane label="download">
            <Bar to={62} />
          </Lane>
          <Lane label="login">
            <span className="osf-chip is-bad">reads a half-written table</span>
          </Lane>
        </>
      ),
      () => (
        <>
          <Lane label="download">
            <Bar to={100} />
          </Lane>
          <Lane label="login">
            <span className="osf-chip is-good">waits · cache loads once</span>
          </Lane>
        </>
      ),
    ],
  },
  vm: {
    bad: 1,
    frames: [
      () => (
        <>
          <p className="osf-cap">fresh macOS VM</p>
          <div className="osf-term">
            <span className="is-on">$ install OpenClaw</span>
            <span>…</span>
          </div>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">fresh macOS VM</p>
          <div className="osf-term">
            <span className="is-on">$ install OpenClaw</span>
            <span className="is-on is-bad">fails: Node.js not installed</span>
          </div>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">updated guide</p>
          <div className="osf-term">
            <span className="is-on is-good">1 · install Node.js ✓</span>
            <span className="is-on is-good">2 · install OpenClaw ✓</span>
            <span className="is-on is-good">3 · SSH tunnel + pairing link ✓</span>
          </div>
        </>
      ),
    ],
  },
  nav: {
    bad: 1,
    frames: [
      () => (
        <>
          <p className="osf-cap">container · 1,248px</p>
          <NavBar width={96} />
          <p>nine labels need 1,412px</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">container · 1,248px</p>
          <NavBar width={108} />
          <p className="is-bad">overflows by 84px · logo clipped</p>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">1280 to 1535px</p>
          <NavBar width={94} />
          <p className="is-good">fits at every width</p>
        </>
      ),
    ],
  },
  docs: {
    bad: 1,
    frames: [
      () => (
        <>
          <p className="osf-cap">CLAUDE.md</p>
          <div className="osf-term">
            <span className="is-on">SingleSwitch · trainable router</span>
            <span className="is-on">install --extra dev</span>
          </div>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">CLAUDE.md vs the code</p>
          <div className="osf-term">
            <span className="is-on is-bad">SingleSwitch: removed</span>
            <span className="is-on is-bad">dev is a dependency group</span>
          </div>
        </>
      ),
      () => (
        <>
          <p className="osf-cap">CLAUDE.md · AUDIO.md</p>
          <div className="osf-term">
            <span className="is-on is-good">MultiSwitch · coded memory</span>
            <span className="is-on is-good">install --group dev</span>
            <span className="is-on is-good">audio setup documented</span>
          </div>
        </>
      ),
    ],
  },
};
