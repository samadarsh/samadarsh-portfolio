import type { HeroProof } from '../../data/heroProofs';
import { easeOut, fitCanvas, fitFont, fontsReady, layer, token, trackPointer, whileVisible, type HeroEngine, type Stage } from './stage';

/**
 * Espresso's hero: two layers cut into square tiles. Research (dark) shows the name and the
 * question behind each project; production (accent) shows the same layout with the measured
 * answers. Tiles near the pointer flip to production, hold for a moment, then flip back. It opens
 * with a curtain of accent tiles that clears corner to corner. With no pointer, a slow lens
 * wanders on its own. Reduced motion shows the research layer with each answer printed in place.
 */

const NAME = 'ADARSH S';
const POSTER = 'Anton, Impact, "Arial Narrow Bold", sans-serif';
const BODY = 'Geist, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const IDLE_MS = 2500;
const STAGGER = 0.02;

type Colors = { bg: string; text: string; muted: string; accent: string; onAccent: string; onAccentSoft: string };

function paint(s: Stage, cell: number, proofs: HeroProof[], prod: boolean, reduced: boolean, col: Colors) {
  const { W, H } = s;
  const { canvas, ctx: g } = layer(s);
  const narrow = W < 640;
  const ink = prod ? col.onAccent : col.text;
  const soft = prod ? col.onAccentSoft : col.muted;
  g.fillStyle = prod ? col.accent : col.bg;
  g.fillRect(0, 0, W, H);
  // A faint dot on every tile corner, so the grid is felt before it is seen.
  g.fillStyle = prod ? col.onAccentSoft : token('--text', 0.07);
  for (let y = cell; y < H; y += cell) for (let x = cell; x < W; x += cell) g.fillRect(x - 1, y - 1, 2, 2);

  const cy = H * 0.46;
  const size = fitFont(g, NAME, POSTER, W * 0.9, Math.min(H * 0.3, 300));
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = ink;
  g.fillText(NAME, W / 2, cy);
  g.font = `500 12px ${MONO}`;
  g.fillStyle = prod ? col.onAccent : col.accent;
  g.fillText((prod ? 'production' : 'research').toUpperCase().split('').join(' '), W / 2, cy - size * 0.62);
  g.font = `14px ${BODY}`;
  g.fillStyle = soft;
  g.fillText(prod ? 'Every question answered, and measured.' : 'Questions worth building an answer to.', W / 2, cy + size * 0.6);

  const spots = narrow
    ? [[0.06, 0.22], [0.94, 0.22], [0.06, 0.66], [0.94, 0.66]]
    : [[0.06, 0.26], [0.94, 0.26], [0.06, 0.68], [0.94, 0.68]];
  proofs.forEach((p, i) => {
    const [fx, fy] = spots[i];
    const right = fx > 0.5;
    const x = W * fx;
    const y = H * fy;
    g.textAlign = right ? 'right' : 'left';
    g.textBaseline = 'alphabetic';
    g.font = `${narrow ? 34 : 54}px ${POSTER}`;
    g.fillStyle = prod ? ink : token('--accent', reduced ? 1 : 0.55);
    g.fillText(prod || reduced ? p.value : '?', x, y);
    g.font = `${narrow ? 11 : 13}px ${BODY}`;
    g.fillStyle = soft;
    const lines: string[] = [];
    let line = '';
    for (const word of (prod ? `${p.project} · ${p.label}` : p.question).split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && g.measureText(next).width > (narrow ? 150 : 230)) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
    lines.forEach((l, k) => g.fillText(l, x, y + (narrow ? 16 : 22) + k * (narrow ? 14 : 17)));
  });
  return canvas;
}

export const pixelLens: HeroEngine = (host, canvas, { proofs, reduced, onIntroDone }) => {
  const pointer = trackPointer(host);
  let stage: Stage | null = null;
  let research: HTMLCanvasElement | null = null;
  let production: HTMLCanvasElement | null = null;
  let cell = 40;
  let cols = 0;
  let rows = 0;
  let shown = new Float32Array(0);
  let wanted = new Uint8Array(0);
  let until = new Float64Array(0);
  let curtainFrom = 0;
  let lastActive = 0;
  let t = 0;

  const setup = () => {
    stage = fitCanvas(canvas);
    if (!stage) return;
    cell = stage.W < 640 ? 28 : 40;
    cols = Math.ceil(stage.W / cell);
    rows = Math.ceil(stage.H / cell);
    shown = new Float32Array(cols * rows);
    wanted = new Uint8Array(cols * rows);
    until = new Float64Array(cols * rows);
    const col: Colors = {
      bg: token('--bg'),
      text: token('--text'),
      muted: token('--muted'),
      accent: token('--accent'),
      onAccent: token('--bg'),
      onAccentSoft: token('--bg', 0.7),
    };
    research = paint(stage, cell, proofs, false, reduced, col);
    production = paint(stage, cell, proofs, true, reduced, col);
  };

  /** Flips every tile within the lens radius of (x, y) to production for a moment. */
  const lens = (x: number, y: number, now: number) => {
    const r = stage!.W < 640 ? 2.6 : 3.2;
    const cx = x / cell;
    const cy = y / cell;
    for (let row = Math.max(0, Math.floor(cy - r)); row <= Math.min(rows - 1, cy + r); row++)
      for (let c = Math.max(0, Math.floor(cx - r)); c <= Math.min(cols - 1, cx + r); c++) {
        if (Math.hypot(c + 0.5 - cx, row + 0.5 - cy) > r) continue;
        const i = row * cols + c;
        wanted[i] = 1;
        until[i] = now + 900 + Math.random() * 500;
      }
  };

  const draw = (now: number) => {
    if (!stage || !research || !production) return;
    const { ctx, W, H, dpr } = stage;
    ctx.drawImage(research, 0, 0, W, H);
    if (reduced) return;
    for (let i = 0; i < shown.length; i++) {
      if (wanted[i] && now > until[i]) wanted[i] = 0;
      shown[i] += (wanted[i] - shown[i]) * (wanted[i] ? 0.24 : 0.12);
      if (shown[i] < 0.02) continue;
      const c = i % cols;
      const r = (i / cols) | 0;
      const s = easeOut(shown[i]) * cell;
      ctx.drawImage(production, c * cell * dpr, r * cell * dpr, cell * dpr, cell * dpr, c * cell + (cell - s) / 2, r * cell + (cell - s) / 2, s, s);
    }
    // The opening curtain: accent tiles shrink away along the diagonal.
    const el = (now - curtainFrom) / 1000;
    if (el < (rows + cols) * STAGGER + 0.4) {
      ctx.fillStyle = token('--accent');
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const k = 1 - easeOut((el - (r + c) * STAGGER) / 0.35);
          if (k <= 0.01) continue;
          const s = k * cell;
          ctx.fillRect(c * cell + (cell - s) / 2, r * cell + (cell - s) / 2, s, s);
        }
    }
  };

  let stop = () => {};
  let cancelled = false;
  const resize = new ResizeObserver(() => {
    setup();
    draw(performance.now());
  });

  const fonts = fontsReady(['100px Anton', '14px Geist', '500 12px "JetBrains Mono"']);
  // Fonts that arrive after the first frame: repaint in the right faces.
  fonts.all.then(() => {
    if (cancelled || !stage) return;
    setup();
    draw(performance.now());
  });
  fonts.first.then(() => {
    if (cancelled) return;
    curtainFrom = performance.now();
    setup();
    draw(curtainFrom);
    resize.observe(host);
    if (reduced) {
      onIntroDone();
      return;
    }
    let introDone = false;
    const curtainEnd = () => ((rows + cols) * STAGGER + 0.4) * 1000;
    stop = whileVisible(host, (now) => {
      t += 0.016;
      const p = pointer.p;
      if (p.active) {
        lens(p.x, p.y, now);
        lastActive = now;
      } else if (stage && now - curtainFrom > curtainEnd() + 600 && now - lastActive > IDLE_MS) {
        lens(stage.W * (0.5 + 0.38 * Math.sin(t * 0.7)), stage.H * (0.47 + 0.16 * Math.sin(t * 1.3)), now);
      }
      draw(now);
      if (!introDone && now - curtainFrom > 900) {
        introDone = true;
        onIntroDone();
      }
    });
  });

  return () => {
    cancelled = true;
    stop();
    resize.disconnect();
    pointer.dispose();
  };
};
