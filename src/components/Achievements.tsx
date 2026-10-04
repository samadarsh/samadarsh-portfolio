import { AnimatePresence, m } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useBackToClose } from '../hooks/useBackToClose';
import { useLocation } from 'react-router-dom';
import {
  ACHIEVEMENTS,
  getUnlocked,
  onAchievementUnlocked,
  recordPageVisit,
  resetAchievements,
  subscribeAchievements,
  unlock,
  type AchievementId,
} from '../lib/achievements';
import { lockScroll } from '../lib/smoothScroll';

const AchievementsContext = createContext<{ open: () => void }>({ open: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useAchievementsPanel = () => useContext(AchievementsContext);

const useUnlocked = () => useSyncExternalStore(subscribeAchievements, getUnlocked, getUnlocked);

/**
 * Tracks progress (page visits, `[data-achievement]` clicks), (the navbar ring glows on each unlock),
 * and renders the achievements panel.
 */
export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const closePanel = useCallback(() => setIsOpen(false), []);
  useBackToClose(isOpen, closePanel);
  const { pathname } = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => unlock('arrived'), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => recordPageVisit(pathname), [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-achievement]');
      if (el) unlock(el.dataset.achievement as AchievementId);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <AchievementsContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen ? <AchievementsPanel onClose={closePanel} /> : null}
      </AnimatePresence>
    </AchievementsContext.Provider>
  );
}

/** Navbar button: a progress ring around the unlocked count. */
export function AchievementsButton({ className = '' }: { className?: string }) {
  const unlocked = useUnlocked();
  const { open } = useAchievementsPanel();
  const done = unlocked.size;
  const total = ACHIEVEMENTS.length;
  const r = 19;
  const circumference = 2 * Math.PI * r;
  const [pulse, setPulse] = useState(false);

  // A brief glow on unlock: the quiet cue on phones, where unlock pop-ups are switched off.
  useEffect(() => {
    let timer = 0;
    const stop = onAchievementUnlocked(() => {
      setPulse(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setPulse(false), 1600);
    });
    return () => {
      stop();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={open}
      className={`relative flex items-center justify-center rounded-full border font-mono text-xs text-text-primary transition-[border-color,box-shadow,transform] duration-500 hover:border-accent/40 ${
        pulse
          ? 'border-accent/70 shadow-[0_0_0_4px_hsl(var(--accent)/0.18),0_0_18px_hsl(var(--accent)/0.35)] motion-safe:scale-110'
          : 'border-white/[0.08]'
      } ${className}`}
      aria-label={`Achievements: ${done} of ${total} unlocked`}
      title="Achievements"
    >
      <svg className="pointer-events-none absolute inset-[-1px]" viewBox="0 0 42 42" aria-hidden>
        <circle
          cx="21"
          cy="21"
          r={r}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - done / total)}
          transform="rotate(-90 21 21)"
          className="transition-[stroke-dashoffset] duration-700"
          opacity={done ? 1 : 0}
        />
      </svg>
      <span className="relative tabular-nums">{done}</span>
    </button>
  );
}

function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const unlocked = useUnlocked();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const done = unlocked.size;
  const total = ACHIEVEMENTS.length;

  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    const unlockScroll = lockScroll();
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      unlockScroll();
      document.removeEventListener('keydown', onKeyDown);
      if (restore && restore !== document.body && document.contains(restore)) {
        restore.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  return (
    <m.div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-start md:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <m.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievements-title"
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border border-white/[0.1] bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)] md:max-w-md md:rounded-3xl md:pb-5"
        data-lenis-prevent
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/[0.12] md:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="achievements-title"
              className="font-display text-3xl tracking-tight text-text-primary"
            >
              Achievements
            </h2>
            <p className="mt-1 text-sm text-muted">
              {done === total
                ? 'All unlocked. You’ve seen everything.'
                : `${done} of ${total} unlocked. Small rewards for looking around.`}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/[0.08] text-muted hover:text-text-primary md:h-9 md:w-9"
            aria-label="Close achievements"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>

        <ul className="mt-5 grid gap-2">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.has(a.id);
            return (
              <li
                key={a.id}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 ${
                  got ? 'border-accent/30 bg-accent/[0.06]' : 'border-white/[0.06]'
                }`}
              >
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg ${
                    got ? 'bg-accent/15' : 'bg-white/[0.03] opacity-40 grayscale'
                  }`}
                  aria-hidden
                >
                  {a.icon}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${got ? 'text-text-primary' : 'text-muted'}`}>
                    {a.name}
                    <span className="sr-only">{got ? ' (unlocked)' : ' (locked)'}</span>
                  </p>
                  <p className="text-[13px] text-muted">{a.description}</p>
                </div>
                {got ? (
                  <span className="ml-auto text-accent" aria-hidden>
                    ✓
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex items-center justify-end gap-3 text-sm">
          {confirmReset ? (
            <>
              <span className="text-muted">Clear all progress?</span>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] px-2 text-muted hover:text-text-primary md:min-h-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAchievements();
                  setConfirmReset(false);
                }}
                className="min-h-[44px] px-2 text-accent md:min-h-0"
              >
                Reset
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[44px] px-2 text-muted hover:text-text-primary md:min-h-0"
            >
              Reset progress
            </button>
          )}
        </div>
      </m.section>
    </m.div>
  );
}
