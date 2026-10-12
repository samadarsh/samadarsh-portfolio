import type { SpeechWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// VoiceNote's five scenes: listen, prepare, transcribe, romanize, check.

const fmt = (n: number) => n.toLocaleString('en-US');

/** The reference sentence with the text VoiceNote missed ([[x]]) marked. */
function Reference({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[\[[^\]]+\]\])/).map((part, i) => {
        const miss = part.match(/^\[\[([^\]]+)\]\]$/);
        return miss ? (
          <ins key={i} className="wt-miss" title="VoiceNote's transcript lacks this">
            {miss[1]}
          </ins>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

export function SpeechScenes({ d, tokens }: { d: SpeechWalkthrough; tokens: Token[] }) {
  const { audio } = d;
  const file = audio.src.split('/').pop();
  // Every third peak, for the 16 kHz strip: a third of the samples.
  const thinned = audio.peaks.filter((_, i) => i % 3 === 0);
  const chunkShare = Math.min(1, audio.seconds / d.chunkSeconds);
  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>{file}</span>
          <span>
            {audio.seconds} s · {audio.sampleRateIn / 1000} kHz
          </span>
        </div>
        <div className="wt-wave">
          {audio.peaks.map((h, i) => (
            <i
              key={i}
              style={{ ['--h' as string]: Math.max(0.04, h), ['--x' as string]: i / audio.peaks.length }}
            />
          ))}
        </div>
        <p className="wt-wave-meta">Tamil · {audio.speaker}</p>
      </div>

      <div className="wt-scene" data-scene="1">
        <div className="wt-scene-label">
          <span>pydub · resample + chunk</span>
          <span>whisper wants 16 kHz</span>
        </div>
        <div className="wt-rate">
          <span className="wt-rate-label">
            {audio.sampleRateIn / 1000} kHz · {fmt(audio.samplesIn)} samples
          </span>
          <div className="wt-strip">
            {audio.peaks.map((h, i) => (
              <i key={i} style={{ ['--h' as string]: Math.max(0.05, h) }} />
            ))}
          </div>
        </div>
        <div className="wt-rate wt-rate-16">
          <span className="wt-rate-label">
            16 kHz · {fmt(audio.samples16k)} samples
          </span>
          <div className="wt-strip">
            {thinned.map((h, i) => (
              <i
                key={i}
                style={{ ['--h' as string]: Math.max(0.05, h), ['--d' as string]: (i / thinned.length) * 0.5 }}
              />
            ))}
          </div>
        </div>
        <div className="wt-chunkbar" style={{ ['--c' as string]: chunkShare }}>
          <span className="wt-rate-label">
            chunk 1 · 0–{audio.seconds} s of a {d.chunkSeconds} s window
          </span>
          <span className="wt-chunkbar-track">
            <i />
          </span>
        </div>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>{d.model} · language = ta</span>
          <span className="wt-gen" />
        </div>
        <p className="wt-tamil wt-transcript" lang="ta">
          <TypedTokens tokens={tokens} />
        </p>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>tamil_to_ascii · grapheme by grapheme</span>
          <span>{d.romanized.length} words</span>
        </div>
        <ol className="wt-roman">
          {d.romanized.map(([ta, latin], i) => (
            <li key={i} className="wt-li" style={{ ['--i' as string]: i }}>
              <span className="wt-tamil" lang="ta">
                {ta}
              </span>
              <span className="wt-arrow" aria-hidden>
                →
              </span>
              <span className="wt-latin">{latin}</span>
            </li>
          ))}
        </ol>
        <div className="wt-graphemes" style={{ ['--n' as string]: d.romanized.length }}>
          <span className="wt-tamil" lang="ta">
            {d.graphemes.word}
          </span>
          <span className="wt-arrow" aria-hidden>
            =
          </span>
          {d.graphemes.parts.map(([g, l], i) => (
            <span key={i} className="wt-gr">
              <span lang="ta">{g}</span>
              <b>{l}</b>
            </span>
          ))}
        </div>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>check · against the data set's transcript</span>
          <span>
            {d.errors.chars} of {d.errors.charTotal} characters
          </span>
        </div>
        <div className="wt-compare">
          <span className="wt-rate-label">speaker read</span>
          <p className="wt-tamil" lang="ta">
            <Reference text={d.reference} />
          </p>
          <span className="wt-rate-label">voicenote heard</span>
          <p className="wt-tamil" lang="ta">
            {d.transcript}
          </p>
        </div>
        <div className="wt-stats">
          <span>
            character error <b>{((100 * d.errors.chars) / d.errors.charTotal).toFixed(1)}%</b>
          </span>
          <span>
            words wrong{' '}
            <b>
              {d.errors.words} of {d.errors.wordTotal}
            </b>
          </span>
          <span>
            time <b>{d.latencySeconds} s</b>
          </span>
        </div>
        <p className="wt-note">{d.otherClips}</p>
      </div>
    </>
  );
}
