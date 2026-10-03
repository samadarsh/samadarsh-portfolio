import { AnimatePresence, motion } from 'framer-motion';
import { playSound } from '../lib/sound';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ToastInput = {
  title: string;
  description?: string;
  icon?: string;
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<(toast: ToastInput) => void>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

const MAX_TOASTS = 3;
const DURATION_MS = 3800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    playSound('success');
    setToasts((list) => [...list, { ...toast, id }].slice(-MAX_TOASTS));
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), DURATION_MS);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-[120] md:bottom-5 flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2.5"
        aria-live="polite"
        role="status"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-surface px-3.5 py-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
            >
              {t.icon ? (
                <span
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-accent/50 bg-accent/10 text-base"
                  aria-hidden
                >
                  {t.icon}
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{t.title}</p>
                {t.description ? <p className="text-[13px] text-muted">{t.description}</p> : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
