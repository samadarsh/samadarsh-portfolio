import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import {
  contact,
  publications,
  experience,
  journalEntries,
  projects,
  socialLinks,
  writingMeta,
} from '../data/content';
import { useGoTo } from '../hooks/useGoTo';
import { copyText, downloadResume, isMac } from '../lib/contact';
import { useToast } from './Toaster';
import { lockScroll } from '../lib/smoothScroll';
import { unlock } from '../lib/achievements';
import { useAchievementsPanel } from './Achievements';
import { useAskAdarsh } from './AskAdarsh';
import { AgentGlyph } from './AgentGlyph';
import { playSound } from '../lib/sound';

type Command = {
  id: string;
  group: string;
  icon: ReactNode;
  label: string;
  /** Short command-style alias shown on the right, e.g. `resume`. */
  hint: string;
  keywords?: string;
  run: () => void;
};

type PaletteContextValue = { open: () => void };

const PaletteContext = createContext<PaletteContextValue>({ open: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useCommandPalette = () => useContext(PaletteContext);

const openExternal = (href: string) => window.open(href, '_blank', 'noopener,noreferrer');

function useCommands(): Command[] {
  const goTo = useGoTo();
  const toast = useToast();
  const { open: openAchievements } = useAchievementsPanel();
  const askAdarsh = useAskAdarsh();

  return useMemo(() => {
    const linkedIn = socialLinks.find((s) => s.label === 'LinkedIn')!.href;
    const gitHub = socialLinks.find((s) => s.label === 'GitHub')!.href;

    return [
      {
        id: 'home',
        group: 'Navigate',
        icon: '↳',
        label: 'Home',
        hint: 'home',
        run: () => goTo('/'),
      },
      {
        id: 'work',
        group: 'Navigate',
        icon: '↳',
        label: 'Work',
        hint: 'projects',
        run: () => goTo('/work'),
      },
      {
        id: 'about',
        group: 'Navigate',
        icon: '↳',
        label: 'About',
        hint: 'about',
        keywords: 'bio skills education',
        run: () => goTo('/about'),
      },
      {
        id: 'experience',
        group: 'Navigate',
        icon: '↳',
        label: 'Experience',
        hint: 'experience',
        keywords: 'jobs career roles',
        run: () => goTo('/about', 'experience'),
      },
      {
        id: 'journal',
        group: 'Navigate',
        icon: '↳',
        label: 'Haugtun Research',
        hint: 'writing',
        keywords: 'journal blog markets posts',
        run: () => goTo('/journal'),
      },
      {
        id: 'contact',
        group: 'Navigate',
        icon: '↳',
        label: 'Contact',
        hint: 'contact',
        keywords: 'email reach',
        run: () => goTo(window.location.pathname, 'contact'),
      },

      ...projects.map<Command>((p) => ({
        id: `project-${p.slug}`,
        group: 'Projects',
        icon: '◆',
        label: p.title,
        hint: p.eyebrow.split(' · ')[0].toLowerCase(),
        keywords: `${p.eyebrow} ${p.stack.join(' ')} ${p.summary}`,
        run: () => goTo(`/work/${p.slug}`),
      })),

      ...experience.map<Command>((x) => ({
        id: `xp-${x.company}`,
        group: 'Experience',
        icon: '◇',
        label: `${x.company}`,
        hint: x.period.split(' — ')[0].toLowerCase(),
        keywords: `${x.role} ${x.summary}`,
        run: () => goTo('/about', 'experience'),
      })),

      ...publications.map<Command>((pub) => ({
        id: `pub-${pub.title}`,
        group: 'Publications',
        icon: '§',
        label: pub.title,
        hint: pub.venues[0].kind === 'Journal' ? 'journal' : 'conference',
        keywords: `publication paper research ${pub.venues.map((v) => v.name).join(' ')} ${pub.topics.join(' ')}`,
        run: () => goTo('/about', 'publications'),
      })),

      ...journalEntries.map<Command>((j) => ({
        id: `post-${j.href}`,
        group: 'Writing',
        icon: '¶',
        label: j.title,
        hint: j.tag.toLowerCase(),
        keywords: `${j.summary} haugtun`,
        run: () => openExternal(j.href),
      })),

      {
        id: 'copy-email',
        group: 'Actions',
        icon: '⧉',
        label: 'Copy email address',
        hint: 'email',
        keywords: contact.email,
        run: async () => {
          unlock('contact');
          const ok = await copyText(contact.email);
          toast(
            ok
              ? { title: 'Email copied', description: contact.email, icon: '✓' }
              : { title: 'Email', description: contact.email },
          );
        },
      },
      {
        id: 'resume',
        group: 'Actions',
        icon: '↓',
        label: 'Download resume',
        hint: 'resume',
        keywords: 'cv pdf',
        run: () => {
          downloadResume();
          toast({ title: 'Downloading resume', description: contact.resumeFile, icon: '📄' });
        },
      },
      {
        id: 'linkedin',
        group: 'Links',
        icon: '↗',
        label: 'LinkedIn',
        hint: 'linkedin',
        run: () => openExternal(linkedIn),
      },
      {
        id: 'github',
        group: 'Links',
        icon: '↗',
        label: 'GitHub',
        hint: 'github',
        keywords: 'code repos',
        run: () => openExternal(gitHub),
      },
      {
        id: 'haugtun',
        group: 'Links',
        icon: '↗',
        label: 'Haugtun on LinkedIn',
        hint: 'haugtun',
        run: () => openExternal(writingMeta.pageUrl),
      },

      {
        id: 'ask',
        group: 'Actions',
        icon: <AgentGlyph size={14} className="mx-auto" />,
        label: 'Ask Adarsh (AI)',
        hint: 'ask',
        keywords: 'ai chat question assistant',
        run: () => askAdarsh.open(),
      },
      {
        id: 'achievements',
        group: 'Actions',
        icon: '★',
        label: 'Achievements',
        hint: 'achievements',
        keywords: 'progress badges',
        run: openAchievements,
      },
      {
        id: 'chart-game',
        group: 'Actions',
        icon: '📈',
        label: 'Play Read the chart',
        hint: 'play',
        keywords: 'game nifty market candles',
        run: () => goTo('/journal', 'chart-game'),
      },
      {
        id: 'whoami',
        group: 'Fun',
        icon: '$',
        label: 'whoami',
        hint: 'whoami',
        run: () =>
          toast({
            title: 'Adarsh S',
            description: 'AI engineer building agents, RAG and market systems. Chennai, India.',
            icon: '👋',
          }),
      },
      {
        id: 'hire',
        group: 'Fun',
        icon: '$',
        label: 'hire adarsh',
        hint: 'hire',
        run: () => {
          unlock('hire');
          goTo(window.location.pathname, 'contact');
          toast({
            title: 'Great choice.',
            description: 'Email and resume are right here.',
            icon: '🤝',
          });
        },
      },
    ];
  }, [goTo, toast, openAchievements, askAdarsh]);
}

function matches(command: Command, tokens: string[]) {
  const haystack =
    `${command.label} ${command.hint} ${command.group} ${command.keywords ?? ''}`.toLowerCase();
  return tokens.every((t) => haystack.includes(t));
}

/** Lower is better: exact alias or title, then prefix, then any keyword match. */
function rank(command: Command, query: string) {
  const label = command.label.toLowerCase();
  if (command.hint === query || label === query) return 0;
  if (command.hint.startsWith(query) || label.startsWith(query)) return 1;
  return 2;
}

/** Filters, then orders groups by their best match while keeping each group contiguous. */
function search(commands: Command[], rawQuery: string) {
  const query = rawQuery.trim().toLowerCase();
  const tokens = query.split(/\s+/).filter(Boolean);
  if (!tokens.length) return commands;

  const hits = commands
    .map((command, index) => ({ command, index, score: rank(command, query) }))
    .filter(({ command }) => matches(command, tokens));

  const groupBest = new Map<string, number>();
  for (const h of hits) {
    groupBest.set(h.command.group, Math.min(groupBest.get(h.command.group) ?? 3, h.score));
  }
  const groupOrder = [...new Set(commands.map((c) => c.group))];

  return hits
    .sort(
      (a, b) =>
        groupBest.get(a.command.group)! - groupBest.get(b.command.group)! ||
        groupOrder.indexOf(a.command.group) - groupOrder.indexOf(b.command.group) ||
        a.score - b.score ||
        a.index - b.index,
    )
    .map((h) => h.command);
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      <AnimatePresence>{isOpen ? <Palette onClose={close} /> : null}</AnimatePresence>
    </PaletteContext.Provider>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const commands = useCommands();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const askAdarsh = useAskAdarsh();
  const results = useMemo(() => {
    const found = search(commands, query);
    const q = query.trim();
    if (found.length || q.length < 3) return found;
    return [
      {
        id: 'ask-fallback',
        group: 'Ask Adarsh',
        icon: <AgentGlyph size={14} className="mx-auto" />,
        label: `Ask: “${q}”`,
        hint: 'ai',
        run: () => askAdarsh.open(q),
      },
    ];
  }, [commands, query, askAdarsh]);

  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const activeCommand = results[activeIndex];

  // Focus the input on open, lock page scroll, and give focus back on close.
  useEffect(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const unlockScroll = lockScroll();
    playSound('open');
    unlock('power');
    return () => {
      unlockScroll();
      const el = restoreFocus.current;
      if (el && el !== document.body && document.contains(el)) el.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (activeCommand)
      document.getElementById(`cmdk-${activeCommand.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeCommand]);

  const run = (command: Command | undefined) => {
    if (!command) return;
    onClose();
    // Let the dialog unmount (and focus restore) before navigating or opening a tab.
    playSound('tick');
    window.setTimeout(() => command.run(), 0);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!results.length) return;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((activeIndex + step + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(activeCommand);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  let lastGroup = '';

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:px-4 sm:pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1] bg-surface shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)]"
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
          <span className="font-mono text-accent" aria-hidden>
            ❯
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search or run a command…"
            className="min-w-0 flex-1 bg-transparent font-mono text-base text-text-primary sm:text-[15px] outline-none placeholder:text-muted/70"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-autocomplete="list"
            aria-activedescendant={activeCommand ? `cmdk-${activeCommand.id}` : undefined}
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="rounded-md border border-white/[0.12] px-1.5 py-0.5 font-mono text-[11px] md:text-[10px] text-muted">
            esc
          </kbd>
        </div>

        <ul
          id="cmdk-list"
          role="listbox"
          data-lenis-prevent
          className="max-h-[min(calc(100dvh-9rem),420px)] overflow-y-auto overscroll-contain p-2 sm:max-h-[min(52vh,420px)]"
        >
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted">
              No matches. Try <span className="font-mono text-text-primary">projects</span>,{' '}
              <span className="font-mono text-text-primary">resume</span> or{' '}
              <span className="font-mono text-text-primary">hire</span>.
            </li>
          ) : (
            results.map((c, i) => {
              const heading = c.group !== lastGroup ? c.group : null;
              lastGroup = c.group;
              const selected = i === activeIndex;
              return (
                <li key={c.id} role="presentation">
                  {heading ? (
                    <p
                      className="px-3 pb-1.5 pt-3 font-mono text-[11px] md:text-[10px] uppercase tracking-[0.2em] text-muted"
                      role="presentation"
                    >
                      {heading}
                    </p>
                  ) : null}
                  <div
                    id={`cmdk-${c.id}`}
                    role="option"
                    aria-selected={selected}
                    onMouseMove={() => !selected && setActive(i)}
                    onClick={() => run(c)}
                    className={`grid cursor-pointer grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-3 py-3 text-[15px] sm:py-2.5 sm:text-sm ${
                      selected ? 'bg-white/[0.06] text-text-primary' : 'text-text-primary/85'
                    }`}
                  >
                    <span
                      className={`text-center ${selected ? 'text-accent' : 'text-muted'}`}
                      aria-hidden
                    >
                      {c.icon}
                    </span>
                    <span className="truncate">{c.label}</span>
                    <code className="font-mono text-xs md:text-[11px] text-muted">{c.hint}</code>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 border-t [@media(hover:hover)_and_(pointer:fine)]:flex border-white/[0.06] px-4 py-2.5 text-xs text-muted">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
          </span>
          <span>
            <Kbd>↵</Kbd> open
          </span>
          <span className="ml-auto hidden sm:inline">
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd> <Kbd>K</Kbd> anywhere
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-white/[0.12] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[11px] md:text-[10px] text-text-primary">
      {children}
    </kbd>
  );
}
