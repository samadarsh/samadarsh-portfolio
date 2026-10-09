import { useEffect, useState, type ReactNode } from 'react';
import type { DemoKind } from '../data/content';

/**
 * Short animated loops that stand in for a cover on projects without a live screenshot.
 * Each scene is a pure function of elapsed time `t` (ms). While inactive, `t` is Infinity,
 * which renders the finished state, so the static card (and reduced motion) still reads.
 * Sample names (Acme, Priya) are illustrative; FinSight's exchange is real, from its evaluation
 * on the TCS 2025-26 annual report (the answer and its page citation are FinSight's own).
 */

const HOLD = 2600;

function useClock(active: boolean, total: number) {
  const [t, setT] = useState(Infinity);
  useEffect(() => {
    if (!active) {
      setT(Infinity);
      return;
    }
    const start = performance.now();
    setT(0);
    const id = window.setInterval(() => setT((performance.now() - start) % (total + HOLD)), 40);
    return () => window.clearInterval(id);
  }, [active, total]);
  return t;
}

/** Characters of `text` typed by time `t`, starting at `start` ms at `cps` characters per second. */
const typed = (text: string, t: number, start: number, cps: number) =>
  text.slice(0, Math.max(0, Math.floor(((t - start) / 1000) * cps)));
const typingEnd = (text: string, start: number, cps: number) => start + (text.length / cps) * 1000;

function Typed({ text, t, start, cps }: { text: string; t: number; start: number; cps: number }) {
  const shown = typed(text, t, start, cps);
  const typing = t >= start && shown.length < text.length;
  return <span className={typing ? 'pdemo-caret' : undefined}>{shown}</span>;
}

const Reveal = ({
  show,
  children,
  className = '',
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) => <div className={`pdemo-r ${show ? '' : 'pdemo-off'} ${className}`}>{children}</div>;

function Shell({
  brand,
  pill,
  pillShow = true,
  children,
}: {
  brand: string;
  pill: ReactNode;
  pillShow?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="pdemo-scene">
      <div className="pdemo-top">
        <span className="pdemo-brand">{brand}</span>
        <span className={`pdemo-r ${pillShow ? '' : 'pdemo-off'}`}>{pill}</span>
      </div>
      {children}
    </div>
  );
}

// ---------- FinSight: question answered with page citations ----------
const FIN_DOC = 'annual-report-2025-2026.pdf';
const FIN_PAGES = 360;
const FIN_CHUNKS = 1315;
const FIN_Q = "What drove TCS's FY 2026 operating margin?";
const FIN_A =
  'It rose 70 bps to 25.0%, a 4-year high, on business mix, productivity and pyramid rebalancing.';
const FIN_Q_AT = 1500;
const FIN_A_AT = typingEnd(FIN_Q, FIN_Q_AT, 40) + 1300;
const FIN_END = typingEnd(FIN_A, FIN_A_AT, 60) + 300;

function RagDemo({ t }: { t: number }) {
  const pages = Math.min(FIN_PAGES, Math.max(0, Math.round(((t - 450) / 650) * FIN_PAGES)));
  return (
    <Shell
      brand="FinSight"
      pillShow={t >= 1150}
      pill={<span className="pdemo-pill pdemo-good">Ingested</span>}
    >
      <Reveal show={t >= 400} className="pdemo-box pdemo-doc">
        <span className="pdemo-pdf">PDF</span>
        <span className="pdemo-ellipsis">{FIN_DOC}</span>
        <span className="pdemo-meta">
          {pages} pages · {Math.round((pages / FIN_PAGES) * FIN_CHUNKS).toLocaleString('en-IN')}{' '}
          chunks
        </span>
      </Reveal>
      <Reveal show={t >= FIN_Q_AT} className="pdemo-bubble pdemo-q">
        <Typed text={FIN_Q} t={t} start={FIN_Q_AT} cps={40} />
      </Reveal>
      <Reveal show={t >= FIN_A_AT - 1000} className="pdemo-bubble pdemo-a">
        {t < FIN_A_AT ? (
          <span className="pdemo-think" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <Typed text={FIN_A} t={t} start={FIN_A_AT} cps={60} />
        )}
      </Reveal>
      <Reveal show={t >= FIN_END} className="pdemo-cites">
        <span className="pdemo-cite">
          <b>{FIN_DOC}</b> p.24
        </span>
      </Reveal>
    </Shell>
  );
}

// ---------- RepoMind: repository scanned into a classification and JSON ----------
const TREE = [
  '▾ shop-api/',
  '  ▾ app/',
  '      main.py',
  '    ▸ routes/',
  '    ▸ services/',
  '    ▸ models/',
  '  ▸ tests/',
  '    requirements.txt',
  '    Dockerfile',
];
const JSON_LINES: [string, string | null][] = [
  ['{', null],
  ['  "type": ', '"web_api",'],
  ['  "framework": ', '"FastAPI",'],
  ['  "layers": ', '3,'],
  ['  "deploy": ', '"docker"'],
  ['}', null],
];
const SCAN_AT = 400;
const SCAN_STEP = 230;
const CLS_AT = SCAN_AT + TREE.length * SCAN_STEP + 300;
const JSON_AT = CLS_AT + 600;

function RepoDemo({ t }: { t: number }) {
  const scanned = Math.min(TREE.length, Math.floor((t - SCAN_AT) / SCAN_STEP));
  const scanning = scanned >= 0 && scanned < TREE.length;
  const jsonLines = Math.min(JSON_LINES.length, Math.max(0, Math.floor((t - JSON_AT) / 200) + 1));
  return (
    <Shell brand="RepoMind" pill={<span className="pdemo-pill">github.com/acme/shop-api</span>}>
      <div className="pdemo-cols">
        <div className="pdemo-box pdemo-tree">
          <div
            className="pdemo-scan"
            style={{
              top: `calc(0.6em + ${Math.max(0, scanned)} * 1.65em)`,
              opacity: scanning ? 1 : 0,
            }}
          />
          {TREE.map((line, i) => (
            <div key={line} className={`pdemo-ln ${i < scanned ? 'pdemo-seen' : ''}`}>
              {line} <span className="pdemo-ok">✓</span>
            </div>
          ))}
        </div>
        <div className="pdemo-stack">
          <Reveal show={t >= CLS_AT} className="pdemo-box">
            <dl className="pdemo-kv">
              <dt>Type</dt>
              <dd>Web API</dd>
              <dt>Stack</dt>
              <dd>FastAPI · Docker</dd>
              <dt>Layers</dt>
              <dd>routes → services → models</dd>
            </dl>
          </Reveal>
          <Reveal show={t >= JSON_AT} className="pdemo-box pdemo-json">
            {JSON_LINES.slice(0, jsonLines).map(([key, value], i) => (
              <div key={i}>
                <span className={value ? 'pdemo-key' : undefined}>{key}</span>
                {value ? <span className="pdemo-str">{value}</span> : null}
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </Shell>
  );
}

// ---------- VoiceNote: Tamil speech recorded, transcribed, romanized ----------
const TA = 'நாளை காலை பத்து மணிக்கு சந்திப்போம்';
const LAT = 'naalai kaalai paththu manikku santhippom';
const BARS = 40;
const AMP = Array.from({ length: BARS }, (_, i) =>
  Math.round(22 + 70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) + (i % 5) * 2),
);
const REC_AT = 500;
const BAR_MS = 85;
const REC_END = REC_AT + BARS * BAR_MS;
const TA_AT = REC_END + 1300;
const LAT_AT = TA_AT + 800;

function VoiceDemo({ t }: { t: number }) {
  const recording = t >= REC_AT && t < REC_END;
  const transcribing = t >= REC_END && t < TA_AT;
  const done = t >= TA_AT;
  const bars = Math.min(BARS, Math.max(0, Math.floor((t - REC_AT) / BAR_MS)));
  const secs = Math.min(4, Math.max(0, Math.floor(((t - REC_AT) / (REC_END - REC_AT)) * 4.4)));
  const status = recording
    ? 'Recording'
    : transcribing
      ? 'Whisper · transcribing'
      : done
        ? 'Transcribed'
        : 'Tap to record';
  return (
    <Shell
      brand="VoiceNote AI"
      pill={<span className={`pdemo-pill ${done ? 'pdemo-good' : ''}`}>{status}</span>}
    >
      <div className="pdemo-box pdemo-rec">
        <span
          className={`pdemo-mic ${recording ? 'pdemo-live' : ''} ${done ? 'pdemo-done' : ''}`}
          aria-hidden
        >
          {done ? (
            <svg viewBox="0 0 16 16">
              <path
                d="M3 8.5l3 3 7-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16">
              <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="currentColor" />
              <path
                d="M3 8a5 5 0 0 0 10 0M8 13v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <div className="pdemo-wave">
          {AMP.map((amp, i) => {
            const heard = i < bars;
            // The newest bars flicker like a live input meter.
            const live = recording && i >= bars - 3 && heard;
            const h = heard ? (live ? amp * (0.6 + 0.4 * Math.abs(Math.sin(t / 70 + i))) : amp) : 8;
            return (
              <i
                key={i}
                className={heard ? (recording ? 'pdemo-bar-rec' : 'pdemo-bar-done') : undefined}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
        <span className="pdemo-time">
          {recording ? <span className="pdemo-recdot" /> : null}0:0{secs}
        </span>
      </div>
      <div className="pdemo-box pdemo-out">
        <Reveal show={t >= TA_AT} className="pdemo-line">
          <span className="pdemo-lab">Tamil</span>
          <span className="pdemo-ta" lang="ta">
            {TA}
          </span>
        </Reveal>
        <Reveal show={t >= LAT_AT} className="pdemo-line">
          <span className="pdemo-lab">Romanized</span>
          <span className="pdemo-lat">
            <Typed text={LAT} t={t} start={LAT_AT} cps={24} />
          </span>
        </Reveal>
      </div>
    </Shell>
  );
}

// ---------- GenAI Email: job post in, tailored email out ----------
const REQS = ['Python', 'LLMs', 'RAG', 'FastAPI', 'Vector DBs'];
const MAIL =
  'Hi Priya,\n\nI saw Acme is hiring an ML Engineer for retrieval work. I recently shipped a RAG system over financial PDFs with page-level citations, served through FastAPI.\n\nHappy to walk you through it.';
const REQ_AT = 500;
const MAIL_AT = REQ_AT + REQS.length * 260 + 700;

function EmailDemo({ t }: { t: number }) {
  return (
    <Shell
      brand="GenAI Email"
      pill={<span className="pdemo-pill">careers.acme.com/ml-engineer</span>}
    >
      <div className="pdemo-cols pdemo-cols-mail">
        <div className="pdemo-box pdemo-job">
          <h4>ML Engineer</h4>
          <div className="pdemo-co">Acme Analytics · Bengaluru</div>
          <div className="pdemo-lab pdemo-mt">Extracted requirements</div>
          <div className="pdemo-chips">
            {REQS.map((r, i) => (
              <span
                key={r}
                className={`pdemo-chip pdemo-r ${t >= REQ_AT + i * 260 ? '' : 'pdemo-off'}`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
        <Reveal show={t >= MAIL_AT - 300} className="pdemo-box pdemo-mail">
          <div className="pdemo-subj">
            <b>Subject:</b> ML Engineer role, RAG experience
          </div>
          <div className="pdemo-body">
            <Typed text={MAIL} t={t} start={MAIL_AT} cps={75} />
          </div>
        </Reveal>
      </div>
    </Shell>
  );
}

const SCENES: Record<DemoKind, { total: number; Scene: (props: { t: number }) => JSX.Element }> = {
  rag: { total: FIN_END, Scene: RagDemo },
  repo: { total: JSON_AT + JSON_LINES.length * 200, Scene: RepoDemo },
  voice: { total: typingEnd(LAT, LAT_AT, 24), Scene: VoiceDemo },
  email: { total: typingEnd(MAIL, MAIL_AT, 75), Scene: EmailDemo },
};

export default function ProjectDemo({ kind, active }: { kind: DemoKind; active: boolean }) {
  const { total, Scene } = SCENES[kind];
  const t = useClock(active, total);
  return (
    <div className="pdemo" aria-hidden>
      <Scene t={t} />
    </div>
  );
}
