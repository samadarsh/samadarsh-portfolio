import type { CSSProperties } from 'react';
import type { VisionWalkthrough } from '../../data/walkthrough';
import type { Token } from './tokens';
import { TypedTokens } from './TypedTokens';

// Food Vision's five scenes: the photo, detect, classify, the answer, and the model comparison.

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
const pct = (p: number) => `${Math.round(p * 100)}%`;
const pct1 = (p: number) => `${(p * 100).toFixed(1)}%`;

/** One colour per region, shared by its box and its rows; chosen to read on the photo. */
const COLORS = ['#ff8a5c', '#3fc8c1', '#f6c443'];

type Region = VisionWalkthrough['regions'][number];

/** Where a box sits on the photo, as percentages of its side. */
const boxStyle = ([x1, y1, x2, y2]: Region['box'], size: number): CSSProperties => ({
  left: `${(x1 / size) * 100}%`,
  top: `${(y1 / size) * 100}%`,
  width: `${((x2 - x1) / size) * 100}%`,
  height: `${((y2 - y1) / size) * 100}%`,
});

/** A region cut out of the photo: the photo as a background, scaled and shifted to the box. */
function Crop({ region, d, color }: { region: Region; d: VisionWalkthrough; color: string }) {
  const [x1, y1, x2, y2] = region.box;
  const w = x2 - x1;
  const h = y2 - y1;
  const size = d.photo.size;
  return (
    <span
      className="wt-crop"
      style={{
        aspectRatio: `${w} / ${h}`,
        backgroundImage: `url(${asset(d.photo.src)})`,
        backgroundSize: `${(size / w) * 100}% ${(size / h) * 100}%`,
        backgroundPosition: `${(x1 / (size - w)) * 100}% ${(y1 / (size - h)) * 100}%`,
        ['--c' as string]: color,
      }}
    />
  );
}

function Photo({ d, boxes }: { d: VisionWalkthrough; boxes?: 'coco' | 'dish' }) {
  return (
    <div className="wt-photo">
      <img src={asset(d.photo.src)} alt="" width={d.photo.size} height={d.photo.size} loading="lazy" decoding="async" />
      {boxes
        ? d.regions.map((r, i) => {
            const narrow = r.box[2] - r.box[0] < d.photo.size * 0.2;
            return (
              <span
                key={i}
                className={narrow ? 'wt-box wt-box-narrow' : 'wt-box'}
                style={{ ...boxStyle(r.box, d.photo.size), ['--i' as string]: i, ['--c' as string]: COLORS[i % COLORS.length] }}
              >
                <b>{boxes === 'coco' ? `${r.coco} ${r.score.toFixed(2)}` : `${r.top[0][0]} ${pct(r.top[0][1])}`}</b>
              </span>
            );
          })
        : null}
    </div>
  );
}

export function VisionScenes({ d, tokens }: { d: VisionWalkthrough; tokens: Token[] }) {
  const confident = d.regions.filter((r) => r.top[0][1] >= d.floor).length;
  const worst = Math.max(...d.models.map((m) => m.errors));
  // The bars share an axis that ends just past the largest count, rounded up to a tidy number.
  const axis = Math.ceil(worst / 50) * 50;

  return (
    <>
      <div className="wt-scene" data-scene="0">
        <div className="wt-scene-label">
          <span>Food-101 test · {d.photo.id}</span>
          <span>
            {d.photo.size} × {d.photo.size}
          </span>
        </div>
        <Photo d={d} />
        <p className="wt-whole">
          <span>classified whole</span>
          <b>
            {d.whole.label} {pct1(d.whole.p)}
          </b>
          <span>one label for the whole plate</span>
        </p>
      </div>

      <div className="wt-scene wt-scene-detect" data-scene="1">
        <div className="wt-scene-label">
          <span>YOLO11n · COCO · ONNX</span>
          <span>{d.regions.length} food regions</span>
        </div>
        <Photo d={d} boxes="coco" />
        <ol className="wt-regions">
          {d.regions.map((r, i) => (
            <li key={i} className="wt-li" style={{ ['--i' as string]: i, ['--c' as string]: COLORS[i % COLORS.length] }}>
              <i aria-hidden />
              <code>{r.coco}</code>
              <span>score {r.score.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="wt-scene" data-scene="2">
        <div className="wt-scene-label">
          <span>ViT-S/16 · one crop per region</span>
          <span>
            confident at {pct(d.floor)}+
          </span>
        </div>
        <ol className="wt-dishes">
          {d.regions.map((r, i) => {
            const [label, p] = r.top[0];
            const ok = p >= d.floor;
            return (
              <li
                key={i}
                className={ok ? undefined : 'wt-dish-unsure'}
                style={{ ['--i' as string]: i, ['--n' as string]: d.regions.length }}
              >
                <Crop region={r} d={d} color={COLORS[i % COLORS.length]} />
                <p className="wt-dish-top">
                  <b>{label}</b>
                  <span>{pct1(p)}</span>
                </p>
                <span className="wt-conf" style={{ ['--p' as string]: p, ['--floor' as string]: d.floor }}>
                  <i />
                </span>
                <p className="wt-dish-rest">
                  <em>{ok ? 'confident' : 'not confident'}</em>
                  <span>
                    then {r.top.slice(1).map(([l, q]) => `${l} ${pct1(q)}`).join(', ')}
                  </span>
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="wt-scene" data-scene="3">
        <div className="wt-scene-label">
          <span>POST /detect · nutrition joined</span>
          <span className="wt-gen" data-busy="looking up" data-done={`${d.regions.length} dishes returned`} />
        </div>
        <div className="wt-answer-photo">
          <Photo d={d} boxes="dish" />
          <ul className="wt-kv">
            <li>
              <code>dishes</code>
              <b>{d.regions.length}</b>
              <span>one entry per food region</span>
            </li>
            <li>
              <code>confident</code>
              <b>
                {confident} of {d.regions.length}
              </b>
              <span>the bowl is flagged, not hidden</span>
            </li>
          </ul>
        </div>
        <p className="wt-answer">
          <TypedTokens tokens={tokens} />
        </p>
        <p className="wt-note wt-disclaimer">{d.disclaimer}</p>
      </div>

      <div className="wt-scene" data-scene="4">
        <div className="wt-scene-label">
          <span>errors on {d.testImages.toLocaleString('en-US')} test images</span>
          <span>fewer is better</span>
        </div>
        <ol className="wt-models">
          {d.models.map((m, i) => (
            <li
              key={m.name}
              className={m.deployed ? 'wt-model-on' : undefined}
              style={{ ['--i' as string]: i, ['--n' as string]: d.models.length }}
            >
              <p>
                <b>{m.name}</b>
                <span>
                  {m.training} · {m.params} params
                </span>
                {m.deployed ? <em>deployed</em> : null}
              </p>
              <strong>
                {m.errors}
                <small>{(m.top1 * 100).toFixed(2)}% top-1</small>
              </strong>
              <span className="wt-bar" style={{ ['--w' as string]: m.errors / axis }}>
                <i />
              </span>
            </li>
          ))}
        </ol>
        <ul className="wt-tests">
          {d.tests.map((t) => (
            <li key={t.pair}>
              <code>{t.pair}</code>
              <b>p = {t.p}</b>
              <span>{t.verdict}</span>
            </li>
          ))}
        </ul>
        <p className="wt-chips">
          {d.checks.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </p>
      </div>
    </>
  );
}
