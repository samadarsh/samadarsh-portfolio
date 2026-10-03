import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { contact, projects } from '../data/content';
import { unlock } from '../lib/achievements';
import { lockScroll } from '../lib/smoothScroll';
import { playSound } from '../lib/sound';

type Message = { role: 'user' | 'assistant'; content: string; error?: boolean };

const SUGGESTIONS = [
  'What is he working on now?',
  'Has he built RAG systems?',
  'Experience with AI agents?',
  'Tell me about BiteWise',
  'What’s his markets background?',
  'Any publications?',
];

const ERRORS: Record<string, string> = {
  rate_limited: 'Lots of questions right now. Please try again in a minute.',
  not_configured: `The assistant is offline right now. You can email Adarsh at ${contact.email}.`,
  default: `Something went wrong. Please try again, or email Adarsh at ${contact.email}.`,
};

const AskContext = createContext<{ open: (question?: string) => void }>({ open: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useAskAdarsh = () => useContext(AskContext);

/** Projects named in an answer, so the reply can link straight to their case studies. */
const mentionedProjects = (text: string) =>
  projects.filter((p) => text.toLowerCase().includes(p.title.toLowerCase())).slice(0, 3);

export function AskAdarshProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);

  const open = useCallback((question?: string) => {
    setPending(question?.trim() || undefined);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);
  const { pathname } = useLocation();

  useEffect(() => setIsOpen(false), [pathname]);

  return (
    <AskContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isOpen ? (
          <AskPanel
            messages={messages}
            setMessages={setMessages}
            initialQuestion={pending}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </AskContext.Provider>
  );
}

type PanelProps = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  initialQuestion?: string;
  onClose: () => void;
};

function AskPanel({ messages, setMessages, initialQuestion, onClose }: PanelProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  const ask = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, 500);
      if (!question || loading) return;
      unlock('ask');
      playSound('tick');
      const history = messages
        .filter((m) => !m.error)
        .map(({ role, content }) => ({ role, content }));
      setMessages((list) => [...list, { role: 'user', content: question }]);
      setInput('');
      setLoading(true);
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history }),
        });
        const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
        if (!res.ok || !data.answer) throw new Error(data.error || 'default');
        setMessages((list) => [...list, { role: 'assistant', content: data.answer! }]);
      } catch (error) {
        const code = error instanceof Error ? error.message : 'default';
        setMessages((list) => [
          ...list,
          { role: 'assistant', content: ERRORS[code] ?? ERRORS.default, error: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, setMessages],
  );

  // Focus, scroll lock, Escape, focus restore.
  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    const unlockScroll = lockScroll();
    inputRef.current?.focus({ preventScroll: true });
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

  // A question passed in (e.g. from the command palette) is sent once on open.
  useEffect(() => {
    if (initialQuestion && !asked.current) {
      asked.current = true;
      void ask(initialQuestion);
    }
  }, [initialQuestion, ask]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(input);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[96] flex justify-end bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-title"
        className="flex h-[100dvh] w-full flex-col border-l border-white/[0.1] bg-surface pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-[0_0_120px_-20px_rgba(0,0,0,0.95)] sm:max-w-md"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[11px] font-semibold text-bg"
            aria-hidden
          >
            AS
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="ask-title" className="text-[15px] font-medium text-text-primary">
              Ask Adarsh
            </h2>
            <p className="truncate text-xs text-muted">
              AI answers from his resume, projects and writing
            </p>
          </div>
          {messages.length ? (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="min-h-[44px] px-2 text-sm text-muted hover:text-text-primary md:min-h-0"
            >
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] text-muted hover:text-text-primary md:h-9 md:w-9"
            aria-label="Close Ask Adarsh"
          >
            ✕
          </button>
        </header>

        <div
          ref={logRef}
          className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
          data-lenis-prevent
          aria-live="polite"
        >
          <Bubble role="assistant">
            Hi! I’m an assistant that answers questions about Adarsh: his work, projects, skills and
            background. What would you like to know?
          </Bubble>
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} error={m.error}>
              {m.content}
            </Bubble>
          ))}
          {loading ? (
            <div
              className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-md border border-white/[0.06] bg-white/[0.03] py-3"
              aria-label="Thinking"
            >
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted"
                  style={{ animationDelay: `${d * 150}ms` }}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="border-t border-white/[0.06] p-3">
          {messages.length === 0 ? (
            <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void ask(s)}
                  className="min-h-[36px] flex-shrink-0 rounded-full border border-white/[0.1] px-3 text-[13px] text-muted transition-colors hover:border-accent/40 hover:text-text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label htmlFor="ask-input" className="sr-only">
              Ask a question about Adarsh
            </label>
            <textarea
              id="ask-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void ask(input);
                }
              }}
              placeholder="Ask about his work…"
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-white/[0.1] bg-white/[0.03] px-3.5 py-3 text-base text-text-primary outline-none placeholder:text-muted/70 focus:border-accent/50 sm:text-[15px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="h-12 rounded-xl bg-accent px-4 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
            >
              Ask
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted/70">
            AI can make mistakes. For anything important, email {contact.email}.
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}

function Bubble({
  role,
  error,
  children,
}: {
  role: Message['role'];
  error?: boolean;
  children: ReactNode;
}) {
  const mine = role === 'user';
  const text = typeof children === 'string' ? children : '';
  const links = !mine && !error ? mentionedProjects(text) : [];

  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
          mine
            ? 'rounded-tr-md bg-text-primary text-bg'
            : error
              ? 'rounded-tl-md border border-red-400/30 bg-red-400/[0.06] text-text-primary/90'
              : 'rounded-tl-md border border-white/[0.06] bg-white/[0.03] text-text-primary/90'
        }`}
      >
        {children}
        {links.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {links.map((p) => (
              <Link
                key={p.slug}
                to={`/work/${p.slug}`}
                className="inline-flex min-h-[32px] items-center rounded-full border border-accent/30 px-3 font-mono text-xs text-accent hover:border-accent"
              >
                ↳ {p.title}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
