import { easeOut, fitCanvas, fitFont, fontsReady, layer, token, trackPointer, whileVisible, type HeroEngine, type Stage } from './stage';

/**
 * Paper's hero: the name in heavy black type, and the pointer spills ink across it. Inside the ink
 * the letters turn to paper and the measured results appear under the name. Each drop swells,
 * holds, then dries away. With no pointer the ink paints itself along a slow loop, so phones and
 * idle visitors still see it. Reduced motion shows the name with the results printed beneath.
 */

const NAME = 'ADARSH S';
const FAMILY = '"Archivo Black", "Arial Black", system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const GROW = 0.22;
const HOLD = 1.7;
const DRY = 1.2;
const IDLE_MS = 2200;

type Drop = { x: number; y: number; r: number; born: number; wobble: number };

export const inkReveal: HeroEngine = (host, canvas, { proofs, reduced, onIntroDone }) => {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const hint = coarse ? 'drag across the name' : 'move across the name';
  const pointer = trackPointer(host);
  const drops: Drop[] = [];
  let stage: Stage | null = null;
  let ink: ReturnType<typeof layer> | null = null;
  let size = 0;
  let col = { paper: '', type: '', muted: '', ink: '' };
  let last: { x: number; y: number } | null = null;
  let lastActive = 0;
  let t = 0;

  const setup = () => {
    stage = fitCanvas(canvas);
    if (!stage) return;
    ink = layer(stage);
    size = fitFont(stage.ctx, NAME, FAMILY, stage.W * 0.92, Math.min(stage.H * 0.28, 260));
    col = { paper: token('--bg'), type: token('--text'), muted: token('--muted'), ink: token('--accent') };
  };

  const words = (ctx: CanvasRenderingContext2D, inInk: boolean) => {
    const { W, H } = stage!;
    const cy = H * 0.46;
    const narrow = W < 640;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${size}px ${FAMILY}`;
    ctx.fillStyle = inInk ? col.paper : col.type;
    ctx.fillText(NAME, W / 2, cy);
    const results = proofs.map((p) => p.value).join(narrow ? ' · ' : '  ·  ');
    if (inInk || reduced) {
      ctx.font = `500 ${narrow ? 15 : 20}px ${MONO}`;
      ctx.fillStyle = inInk ? col.paper : col.muted;
      ctx.fillText(results, W / 2, cy + size * 0.68);
    } else {
      ctx.font = `500 ${narrow ? 11 : 12}px ${MONO}`;
      ctx.fillStyle = col.muted;
      ctx.fillText(hint.toUpperCase().split('').join(' '), W / 2, cy + size * 0.68);
    }
  };

  const spill = (x: number, y: number, now: number) => {
    const narrow = stage!.W < 640;
    const from = last ?? { x, y };
    const dist = Math.hypot(x - from.x, y - from.y);
    const steps = Math.max(1, Math.floor(dist / 9));
    for (let k = 1; k <= steps; k++) {
      drops.push({
        x: from.x + ((x - from.x) * k) / steps + (Math.random() - 0.5) * 8,
        y: from.y + ((y - from.y) * k) / steps + (Math.random() - 0.5) * 8,
        r: (narrow ? 26 : 40) + Math.random() * (narrow ? 18 : 30) + Math.min(30, dist * 0.3),
        born: now,
        wobble: Math.random() * Math.PI * 2,
      });
    }
    last = { x, y };
    if (drops.length > 520) drops.splice(0, drops.length - 520);
  };

  const draw = (now: number) => {
    if (!stage || !ink) return;
    const { ctx, W, H } = stage;
    ctx.fillStyle = col.paper;
    ctx.fillRect(0, 0, W, H);
    words(ctx, false);
    if (reduced) return;
    const g = ink.ctx;
    g.clearRect(0, 0, W, H);
    g.fillStyle = col.ink;
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      const age = (now - d.born) / 1000;
      if (age > GROW + HOLD + DRY) {
        drops.splice(i, 1);
        continue;
      }
      const k = age < GROW ? easeOut(age / GROW) : age < GROW + HOLD ? 1 : 1 - easeOut((age - GROW - HOLD) / DRY);
      if (k <= 0) continue;
      g.beginPath();
      g.arc(d.x, d.y, d.r * k * (1 + 0.05 * Math.sin(t * 3 + d.wobble)), 0, Math.PI * 2);
      g.fill();
    }
    // Whatever sits inside the ink is redrawn in paper colour, revealing the results line.
    g.globalCompositeOperation = 'source-atop';
    words(g, true);
    g.globalCompositeOperation = 'source-over';
    ctx.drawImage(ink.canvas, 0, 0, W, H);
  };

  let stop = () => {};
  let cancelled = false;
  const resize = new ResizeObserver(() => {
    setup();
    draw(performance.now());
  });

  const fonts = fontsReady(['100px "Archivo Black"', '500 20px "JetBrains Mono"']);
  // Fonts that arrive after the first frame: repaint in the right faces.
  fonts.all.then(() => {
    if (cancelled || !stage) return;
    setup();
    draw(performance.now());
  });
  fonts.first.then(() => {
    if (cancelled) return;
    setup();
    draw(performance.now());
    resize.observe(host);
    if (reduced) {
      onIntroDone();
      return;
    }
    const start = performance.now();
    let introDone = false;
    stop = whileVisible(host, (now) => {
      t += 0.016;
      const p = pointer.p;
      if (p.active && now - start > 400) {
        spill(p.x, p.y, now);
        lastActive = now;
      } else if (now - lastActive > IDLE_MS && now - start > 500 && stage) {
        // Idle: the ink paints itself along a slow figure across the name.
        spill(stage.W * (0.5 + 0.36 * Math.sin(t * 0.8)), stage.H * (0.46 + 0.1 * Math.sin(t * 1.6)), now);
      } else {
        last = null;
      }
      draw(now);
      if (!introDone && now - start > 900) {
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
