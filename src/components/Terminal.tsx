import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useBackToClose } from '../hooks/useBackToClose';
import { lockScroll } from '../lib/smoothScroll';
import { unlock } from '../lib/achievements';
import { loadTerminalView, TerminalPlaceholder } from './TerminalPlaceholder';

// The shell and its commands load on first open.
const TerminalView = lazy(loadTerminalView);

const TerminalContext = createContext<{ open: () => void }>({ open: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useTerminal = () => useContext(TerminalContext);

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/** Height above the on-screen keyboard, so the prompt never hides behind it. */
function useVisibleHeight(active: boolean) {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () => setHeight(vv.height);
    update();
    vv.addEventListener('resize', update);
    return () => vv.removeEventListener('resize', update);
  }, [active]);
  return height;
}

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();
  const open = useCallback(() => {
    setIsOpen(true);
    unlock('terminal');
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  useBackToClose(isOpen, close);

  // ` opens it from anywhere on keyboards, the way many games and tools open a console.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '`' || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      e.preventDefault();
      setIsOpen((v) => {
        if (!v) unlock('terminal');
        return !v;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A page change from inside the terminal (cd, open) closes it.
  useEffect(() => setIsOpen(false), [pathname]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <TerminalContext.Provider value={value}>
      {children}
      <AnimatePresence>{isOpen ? <TerminalWindow onClose={close} /> : null}</AnimatePresence>
    </TerminalContext.Provider>
  );
}

function TerminalWindow({ onClose }: { onClose: () => void }) {
  const height = useVisibleHeight(true);
  const fine = window.matchMedia('(pointer: fine)').matches;

  useEffect(() => lockScroll(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <m.div
      className="fixed inset-x-0 top-0 z-[98] flex items-stretch justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-6"
      style={{ height: height ?? '100dvh' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <m.div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        className="flex h-full w-full flex-col overflow-hidden bg-[#0b0b0b] pt-[env(safe-area-inset-top)] md:h-[min(640px,82vh)] md:max-w-3xl md:rounded-2xl md:border md:border-white/[0.1] md:pt-0 md:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)]"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
          <div className="hidden gap-1.5 md:flex" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-red-500/70" />
            <span className="h-3 w-3 rounded-full bg-amber-500/70" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
          </div>
          <p className="flex-1 truncate font-mono text-xs text-muted md:text-center">
            adarsh@portfolio — zsh
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:text-text-primary active:bg-white/[0.06]"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <Suspense fallback={<TerminalPlaceholder />}>
            <TerminalView onClose={onClose} autoFocus={fine} />
          </Suspense>
        </div>
      </m.div>
    </m.div>
  );
}
