const STORAGE_KEY = 'portfolio-sound';

type SoundKind = 'tick' | 'open' | 'success';

const TONES: Record<SoundKind, { freq: number; duration: number }> = {
  tick: { freq: 820, duration: 0.05 },
  open: { freq: 660, duration: 0.07 },
  success: { freq: 990, duration: 0.12 },
};

const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
};

let enabled = typeof window !== 'undefined' && read();
let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

export const isSoundOn = () => enabled;

export function subscribeSound(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSoundOn(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

/** Plays a short, quiet UI tone. Does nothing unless the visitor turned sound on. */
export function playSound(kind: SoundKind) {
  if (!enabled) return;
  try {
    ctx ??= new AudioContext();
    const { freq, duration } = TONES[kind];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio unavailable; stay silent.
  }
}
