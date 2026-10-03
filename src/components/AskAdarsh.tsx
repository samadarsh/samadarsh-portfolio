import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
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

type Message = { id: number; role: 'user' | 'assistant'; content: string; error?: boolean };

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

const STORE_KEY = 'ask-adarsh-chat';
const TEASER_KEY = 'ask-adarsh-teased';
const PHONE_QUERY = '(max-width: 767px)';

const AskContext = createContext<{ open: (question?: string) => void }>({ open: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useAskAdarsh = () => useContext(AskContext);

const readStored = (): Message[] => {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]') as Message[];
  } catch {
    return [];
  }
};

/** Phones get a bottom sheet; wider screens get a floating chat window. */
function useIsPhone() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return phone;
}

/** Height of the area above the on-screen keyboard, so the sheet never hides behind it. */
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

export function AskAdarshProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(readStored);
  const [loading, setLoading] = useState(false);
  const [queued, setQueued] = useState<string | null>(null);
  const isPhone = useIsPhone();
  const { pathname } = useLocation();
  const nextId = useRef(messages.reduce((m, x) => Math.max(m, x.id), 0) + 1);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore
    }
  }, [messages]);

  // The phone sheet covers the page, so it closes when a link inside it navigates.
  // On larger screens the window stays open while browsing.
  useEffect(() => {
    if (window.matchMedia(PHONE_QUERY).matches) setIsOpen(false);
  }, [pathname]);

  const ask = useCallback(
    async (raw: string) => {
      const question = raw.trim().slice(0, 500);
      if (!question || loading) return;
      unlock('ask');
      playSound('tick');
      const history = messages
        .filter((m) => !m.error)
        .map(({ role, content }) => ({ role, content }));
      setMessages((list) => [...list, { id: nextId.current++, role: 'user', content: question }]);
      setLoading(true);
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history }),
        });
        const data = (await res.json().catch(() => ({}))) as { answer?: string; error?: string };
        if (!res.ok || !data.answer) throw new Error(data.error || 'default');
        playSound('success');
        const answer = data.answer;
        setMessages((list) => [
          ...list,
          { id: nextId.current++, role: 'assistant', content: answer },
        ]);
      } catch (error) {
        const code = error instanceof Error ? error.message : 'default';
        setMessages((list) => [
          ...list,
          {
            id: nextId.current++,
            role: 'assistant',
            content: ERRORS[code] ?? ERRORS.default,
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  // A question handed in from elsewhere (e.g. the command palette) is sent once the chat opens.
  useEffect(() => {
    if (isOpen && queued && !loading) {
      setQueued(null);
      void ask(queued);
    }
  }, [isOpen, queued, loading, ask]);

  const open = useCallback((question?: string) => {
    if (question?.trim()) setQueued(question.trim());
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const clear = useCallback(() => setMessages([]), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <AskContext.Provider value={value}>
      {children}
      {!isPhone ? <Launcher open={isOpen} onToggle={toggle} /> : null}
      <AnimatePresence>
        {isOpen ? (
          <ChatBox
            key={isPhone ? 'sheet' : 'window'}
            phone={isPhone}
            messages={messages}
            loading={loading}
            onAsk={ask}
            onClear={clear}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </AskContext.Provider>
  );
}

/** Desktop launcher: a glowing ✦ that turns into ✕ while the chat is open. */
function Launcher({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const [teaser, setTeaser] = useState(false);

  // One gentle hint per visitor, a few seconds in.
  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(TEASER_KEY) === '1';
    } catch {
      // ignore
    }
    if (seen) return;
    const show = window.setTimeout(() => setTeaser(true), 6000);
    const hide = window.setTimeout(() => setTeaser(false), 14000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    if (!teaser && !open) return;
    try {
      localStorage.setItem(TEASER_KEY, '1');
    } catch {
      // ignore
    }
  }, [teaser, open]);

  const click = () => {
    setTeaser(false);
    onToggle();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[94] flex items-center gap-3">
      <AnimatePresence>
        {teaser && !open ? (
          <motion.button
            type="button"
            onClick={click}
            initial={{ opacity: 0, x: 10, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 6 }}
            className="rounded-2xl rounded-br-md border border-white/[0.1] bg-surface/95 px-4 py-2.5 text-left text-sm text-text-primary shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl"
          >
            <span className="block font-medium">Questions about Adarsh?</span>
            <span className="text-[13px] text-muted">Ask the AI. It knows his work.</span>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={click}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-text-primary text-bg shadow-[0_18px_45px_-12px_rgba(0,0,0,0.9)]"
        aria-label={open ? 'Close Ask Adarsh' : 'Open Ask Adarsh, an AI assistant'}
        aria-expanded={open}
      >
        {!open ? <span className="ask-launcher-ring" aria-hidden /> : null}
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={open ? 'x' : 'spark'}
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
            className="text-xl leading-none"
            aria-hidden
          >
            {open ? '✕' : '✦'}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

type ChatBoxProps = {
  phone: boolean;
  messages: Message[];
  loading: boolean;
  onAsk: (q: string) => void;
  onClear: () => void;
  onClose: () => void;
};

function ChatBox({ phone, messages, loading, onAsk, onClear, onClose }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const dragControls = useDragControls();
  const visibleHeight = useVisibleHeight(phone);
  // Replies that arrive while the chat is open type themselves out; earlier ones show instantly.
  const [typingFrom] = useState(() => messages.reduce((m, x) => Math.max(m, x.id), 0));

  // Escape closes; the phone sheet also locks the page behind it.
  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    const unlockScroll = phone ? lockScroll() : () => {};
    if (!phone) inputRef.current?.focus({ preventScroll: true });
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
  }, [onClose, phone]);

  const scrollToEnd = useCallback(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(scrollToEnd, [messages.length, loading, scrollToEnd]);

  // Grow the input with its text, up to about four lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const send = (text: string) => {
    if (!text.trim() || loading) return;
    onAsk(text);
    setInput('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  const body = (
    <>
      <header
        className={`relative flex items-center gap-3 border-b border-white/[0.06] px-4 pb-3 ${phone ? 'touch-none pt-5' : 'pt-3'}`}
        onPointerDown={phone ? (e) => dragControls.start(e) : undefined}
      >
        {phone ? (
          <span
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/[0.18]"
            aria-hidden
          />
        ) : null}
        <span className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-[#9a8a6c] font-mono text-xs font-semibold text-bg">
          AS
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-emerald-400" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="ask-title" className="text-[15px] font-medium leading-tight text-text-primary">
            Ask Adarsh
          </h2>
          <p className="text-xs text-muted">
            {loading ? 'Typing…' : 'AI assistant · online'}
          </p>
        </div>
        {messages.length ? (
          <button
            type="button"
            onClick={onClear}
            onPointerDown={(e) => e.stopPropagation()}
            className="min-h-[40px] rounded-full px-3 text-[13px] text-muted transition-colors hover:bg-white/[0.05] hover:text-text-primary"
          >
            New chat
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-text-primary"
          aria-label="Close Ask Adarsh"
        >
          {phone ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          ) : (
            '✕'
          )}
        </button>
      </header>

      <div
        ref={logRef}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
        data-lenis-prevent
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <Welcome onPick={send} />
        ) : (
          messages.map((m) => (
            <Bubble
              key={m.id}
              message={m}
              animate={!reduced && m.role === 'assistant' && !m.error && m.id > typingFrom}
              onProgress={scrollToEnd}
            />
          ))
        )}
        {loading ? <TypingDots /> : null}
      </div>

      <form onSubmit={onSubmit} className="border-t border-white/[0.06] p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.03] p-1.5 pl-3.5 transition-colors focus-within:border-accent/50">
          <label htmlFor="ask-input" className="sr-only">
            Ask a question about Adarsh
          </label>
          <textarea
            id="ask-input"
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={500}
            enterKeyHint="send"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about his work…"
            className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-base text-text-primary outline-none placeholder:text-muted/70 md:text-[15px]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent text-bg transition-all enabled:hover:brightness-110 disabled:opacity-30"
            aria-label="Send"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted/60">
          AI answers can be wrong. For anything important, email {contact.email}
        </p>
      </form>
    </>
  );

  if (phone) {
    const sheetHeight = visibleHeight
      ? Math.min(visibleHeight - 12, window.innerHeight * 0.9)
      : undefined;
    return (
      <motion.div
        className="fixed inset-x-0 top-0 z-[96] flex flex-col justify-end"
        // Pin the overlay to the visible area so the sheet sits right above the keyboard.
        style={{ height: visibleHeight ?? '100dvh' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { delay: 0.15 } }}
      >
        <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden />
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="ask-title"
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.7 }}
          onDragEnd={onDragEnd}
          className="relative flex w-full flex-col overflow-hidden rounded-t-[28px] border-t border-white/[0.1] bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.9)]"
          style={{ height: sheetHeight ?? '90dvh' }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 34, stiffness: 340 }}
        >
          {body}
        </motion.section>
      </motion.div>
    );
  }

  return (
    <motion.section
      role="dialog"
      aria-labelledby="ask-title"
      className="fixed bottom-24 right-6 z-[95] flex h-[min(620px,calc(100dvh-8rem))] w-[392px] flex-col overflow-hidden rounded-[26px] border border-white/[0.1] bg-surface/95 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95),0_0_0_1px_hsl(var(--accent)/0.06)] backdrop-blur-xl"
      style={{ transformOrigin: 'bottom right' }}
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 12 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
    >
      {body}
    </motion.section>
  );
}

function Welcome({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/[0.09] to-transparent p-4">
        <p className="text-[15px] font-medium text-text-primary">Hi, I’m Adarsh’s AI assistant ✦</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Ask about his work, projects, skills or background. I answer from his resume and this
          site, and link you to the details.
        </p>
      </div>
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          Try asking
        </p>
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="group flex min-h-[44px] items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 text-left text-sm text-text-primary/90 transition-colors hover:border-accent/40 hover:bg-white/[0.04]"
            >
              {s}
              <span
                className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              >
                →
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex" aria-label="The assistant is typing">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.04] px-4 py-3.5">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="h-1.5 w-1.5 rounded-full bg-accent"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

/** Reveals text a few words at a time, like a streamed reply. */
function useTypewriter(text: string, enabled: boolean, onProgress: () => void) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [count, setCount] = useState(enabled ? 0 : words.length);
  useEffect(() => {
    if (!enabled) return;
    let i = 0;
    const step = Math.max(1, Math.round(words.length / 70));
    const timer = window.setInterval(() => {
      i = Math.min(words.length, i + step);
      setCount(i);
      onProgress();
      if (i >= words.length) window.clearInterval(timer);
    }, 24);
    return () => window.clearInterval(timer);
  }, [enabled, words, onProgress]);
  return { shown: words.slice(0, count).join(''), done: count >= words.length };
}

/** Plain text with "- " lines shown as a list; stray markdown emphasis is dropped. */
function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\*\*(.+?)\*\*/g, '$1').split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        const isList = lines.length > 0 && lines.every((l) => /^\s*[-•*]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span
                    className="mt-[0.65em] h-1 w-1 flex-shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  <span>{l.replace(/^\s*[-•*]\s+/, '')}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}

function Bubble({
  message,
  animate,
  onProgress,
}: {
  message: Message;
  animate: boolean;
  onProgress: () => void;
}) {
  const mine = message.role === 'user';
  const { shown, done } = useTypewriter(message.content, animate, onProgress);
  const links =
    !mine && !message.error && done
      ? projects
          .filter((p) => message.content.toLowerCase().includes(p.title.toLowerCase()))
          .slice(0, 3)
      : [];

  return (
    <motion.div
      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
          mine
            ? 'rounded-br-md bg-text-primary text-bg'
            : message.error
              ? 'rounded-bl-md border border-red-400/30 bg-red-400/[0.07] text-text-primary/90'
              : 'rounded-bl-md border border-white/[0.06] bg-white/[0.04] text-text-primary/90'
        }`}
      >
        {mine ? message.content : <RichText text={shown} />}
        {links.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {links.map((p) => (
              <Link
                key={p.slug}
                to={`/work/${p.slug}`}
                className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-accent/30 bg-accent/[0.06] px-3 text-xs text-accent transition-colors hover:border-accent"
              >
                {p.title} <span aria-hidden>→</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
