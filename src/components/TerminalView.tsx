import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  contact,
  education,
  experience,
  heroContent,
  projects,
  publications,
  socialLinks,
  type Project,
} from '../data/content';
import { copyText, downloadResume } from '../lib/contact';
import { unlock } from '../lib/achievements';
import { useAskAdarsh } from './AskAdarsh';

/**
 * A small shell over the portfolio's own data: `ls`, `cat`, `git log`, `cd` and friends.
 * Used full screen (Terminal.tsx) and inline on the 404 page. Every command can also be run
 * by tapping a suggestion, so it works on phones without typing.
 */

// "ADARSH" in figlet's Small font, kept narrow enough for a 360px phone.
const GLYPHS: Record<string, string[]> = {
  A: ['   _   ', '  /_\\  ', ' / _ \\ ', '/_/ \\_\\'],
  D: [' ___  ', '|   \\ ', '| |) |', '|___/ '],
  R: [' ___ ', '| _ \\', '|   /', '|_|_\\'],
  S: [' ___ ', '/ __|', '\\__ \\', '|___/'],
  H: [' _  _ ', '| || |', '| __ |', '|_||_|'],
};
const BANNER = [0, 1, 2, 3]
  .map((row) => [...'ADARSH'].map((c) => GLYPHS[c][row]).join(''))
  .join('\n');

const PAGES: Record<string, string> = {
  '~': '/',
  '/': '/',
  home: '/',
  work: '/work',
  projects: '/work',
  about: '/about',
  journal: '/journal',
  haugtun: '/journal',
  writing: '/journal',
};

const DEFAULT_SUGGESTIONS = ['whoisadarsh', 'ls projects', 'cat bite-wise', 'git log', 'help'];

const pathToCwd = (pathname: string) => (pathname === '/' ? '~' : `~${pathname}`);

/** Short, stable pseudo-hash for `git log` lines. */
function shortHash(text: string) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}

const findProject = (arg: string) => {
  const q = arg
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/^projects\//, '')
    .trim();
  if (!q) return undefined;
  return (
    projects.find((p) => p.slug === q || p.title.toLowerCase() === q) ??
    projects.find((p) => p.slug.startsWith(q) || p.title.toLowerCase().startsWith(q))
  );
};

const COMMANDS = [
  'help',
  'whoisadarsh',
  'ls',
  'cat',
  'open',
  'cd',
  'git log',
  'ask',
  'contact',
  'resume',
  'clear',
  'exit',
];

type Line = { id: number; node: ReactNode };

type Effects = {
  navigate: (to: string) => void;
  ask: (question: string) => void;
  close: () => void;
  embedded: boolean;
};

type Result = { out?: ReactNode; clear?: boolean; suggest?: string[] };

const Muted = ({ children }: { children: ReactNode }) => (
  <span className="text-muted">{children}</span>
);
const Acc = ({ children }: { children: ReactNode }) => (
  <span className="text-accent">{children}</span>
);
const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-accent underline decoration-accent/40 underline-offset-2"
  >
    {children}
  </a>
);

function catProject(p: Project): ReactNode {
  return (
    <>
      <Acc># {p.title}</Acc>
      {'\n'}
      <Muted>
        {p.eyebrow} · {p.year} · {p.role}
      </Muted>
      {'\n\n'}
      {p.summary}
      {'\n\n'}
      {p.highlights.map((h) => `- ${h.replace(/`/g, '')}\n`).join('')}
      {'\n'}
      <Muted>stack:</Muted> {p.stack.join(', ')}
      {p.links.live ? (
        <>
          {'\n'}
          <Muted>live: </Muted>
          <Ext href={p.links.live}>{p.links.live.replace(/^https?:\/\//, '')}</Ext>
        </>
      ) : null}
      {p.links.github ? (
        <>
          {'\n'}
          <Muted>code: </Muted>
          <Ext href={p.links.github}>{p.links.github.replace(/^https?:\/\//, '')}</Ext>
        </>
      ) : null}
    </>
  );
}

function run(raw: string, fx: Effects): Result {
  const input = raw.trim();
  if (!input) return {};
  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ');
  const name = cmd.toLowerCase();

  switch (name) {
    case 'help':
    case '?':
    case 'man':
      return {
        out: (
          <>
            {[
              ['whoisadarsh', 'who is Adarsh'],
              ['ls [dir]', 'list projects/, experience/, papers/'],
              ['cat <project>', 'read a project, e.g. cat finsight'],
              ['open <project>', 'open its case study'],
              ['cd <page>', 'go to ~, work, about or journal'],
              ['git log', 'career history'],
              ['ask <question>', 'ask the AI assistant'],
              ['contact', 'email and links'],
              ['resume', 'download the resume'],
              ['clear', 'clear the screen'],
              ['exit', fx.embedded ? 'go to the home page' : 'close the terminal'],
            ].map(([c, d]) => (
              <Fragment key={c}>
                <Acc>{c.padEnd(16)}</Acc>
                <Muted>{d}</Muted>
                {'\n'}
              </Fragment>
            ))}
          </>
        ),
        suggest: ['whoisadarsh', 'ls projects', 'git log'],
      };

    case 'whoisadarsh':
    case 'whoami': // what developers type out of habit
      return {
        out: (
          <>
            <Acc>Adarsh S</Acc> — {experience[0].role} at {experience[0].company}
            {'\n'}
            {heroContent.tagline}
            {'\n'}
            <Muted>
              {heroContent.location} · B.Tech AI & Data Science · {publications.length} research
              papers
            </Muted>
          </>
        ),
        suggest: ['git log', 'ls projects', 'contact'],
      };

    case 'ls':
    case 'dir': {
      const dir = arg.replace(/\/$/, '').replace(/^~\//, '').toLowerCase();
      if (!dir || dir === '.' || dir === '~')
        return {
          out: (
            <>
              <Acc>projects/</Acc>
              {'   '}
              <Acc>experience/</Acc>
              {'   '}
              <Acc>papers/</Acc>
              {'   '}resume.pdf
            </>
          ),
          suggest: ['ls projects', 'ls experience', 'ls papers'],
        };
      if (dir === 'projects' || dir === 'work')
        return {
          out: projects.map((p) => (
            <Fragment key={p.slug}>
              <Acc>{p.slug.padEnd(17)}</Acc>
              <Muted>
                {p.eyebrow} · {p.year}
              </Muted>
              {'\n'}
            </Fragment>
          )),
          suggest: ['cat bite-wise', 'cat fin-sight', 'cat voicenote-ai'],
        };
      if (dir === 'experience')
        return {
          out: experience.map((x) => (
            <Fragment key={x.company}>
              <Muted>{x.period.padEnd(22)}</Muted>
              {x.role} <Acc>@ {x.company}</Acc>
              {'\n'}
            </Fragment>
          )),
          suggest: ['git log', 'cd about'],
        };
      if (dir === 'papers' || dir === 'publications')
        return {
          out: publications.map((p) => (
            <Fragment key={p.title}>
              - {p.title}
              {'\n'}
              <Muted>
                {'  '}
                {p.venues.map((v) => v.name).join('; ')}
              </Muted>
              {'\n'}
            </Fragment>
          )),
        };
      return { out: <span className="text-red-300">ls: {arg}: No such file or directory</span> };
    }

    case 'cat':
    case 'less':
    case 'more': {
      if (!arg) return { out: <Muted>usage: cat &lt;project&gt; — try ls projects</Muted> };
      if (/resume/i.test(arg))
        return {
          out: <Muted>cat: resume.pdf: binary file. Try `resume` to download it.</Muted>,
          suggest: ['resume'],
        };
      const p = findProject(arg);
      if (!p)
        return {
          out: <span className="text-red-300">cat: {arg}: No such file. Try ls projects.</span>,
          suggest: ['ls projects'],
        };
      return { out: catProject(p), suggest: [`open ${p.slug}`, 'ls projects'] };
    }

    case 'open': {
      const p = findProject(arg);
      if (!p)
        return { out: <Muted>usage: open &lt;project&gt; — e.g. open {projects[0].slug}</Muted> };
      fx.navigate(`/work/${p.slug}`);
      fx.close();
      return { out: <Muted>Opening {p.title}…</Muted> };
    }

    case 'cd': {
      const target = arg.replace(/^~\//, '').replace(/\/$/, '').toLowerCase() || '~';
      const to = target === '..' ? '/' : PAGES[target];
      if (!to)
        return {
          out: <span className="text-red-300">cd: no such directory: {arg}</span>,
          suggest: ['cd work', 'cd about', 'cd ~'],
        };
      fx.navigate(to);
      if (fx.embedded || to !== window.location.pathname) fx.close();
      return {};
    }

    case 'git': {
      if (rest[0] !== 'log')
        return {
          out: <Muted>Only `git log` is wired up here. Try it.</Muted>,
          suggest: ['git log'],
        };
      const commits = [
        ...experience.map((x) => ({
          date: x.period.split(/\s+—\s+/)[0],
          msg: `${x.role} @ ${x.company}`,
        })),
        ...education.map((e) => ({
          date: e.period.split(/\s+—\s+/)[0],
          msg: `${e.degree}, ${e.school}`,
        })),
      ];
      return {
        out: commits.map((c, i) => (
          <Fragment key={c.msg}>
            <span className="text-amber-300/90">{shortHash(c.msg)}</span>
            {i === 0 ? <Acc> (HEAD -&gt; main)</Acc> : null} <Muted>{c.date.padEnd(9)}</Muted>
            {c.msg}
            {'\n'}
          </Fragment>
        )),
        suggest: ['ls experience', 'cd about'],
      };
    }

    case 'ask': {
      if (!arg)
        return {
          out: <Muted>usage: ask &lt;question&gt; — e.g. ask what is he building now?</Muted>,
        };
      fx.ask(arg.replace(/^["']|["']$/g, ''));
      fx.close();
      return {};
    }

    case 'contact':
    case 'email':
    case 'mail':
      void copyText(contact.email).then((ok) => ok && unlock('contact'));
      return {
        out: (
          <>
            <Muted>email: </Muted>
            {contact.email} <Muted>(copied)</Muted>
            {socialLinks
              .filter((l) => l.label !== 'Email')
              .map((l) => (
                <Fragment key={l.label}>
                  {'\n'}
                  <Muted>{`${l.label.toLowerCase()}:`.padEnd(10)}</Muted>
                  <Ext href={l.href}>{l.href.replace(/^https?:\/\//, '')}</Ext>
                </Fragment>
              ))}
          </>
        ),
        suggest: ['resume', 'ask how can I reach him?'],
      };

    case 'resume':
    case 'cv':
      downloadResume();
      unlock('resume');
      return { out: <Muted>Downloading {contact.resumeFile}…</Muted> };

    case 'hire':
      unlock('hire');
      return {
        out: (
          <>
            Good taste. Write to <Acc>{contact.email}</Acc> and mention the terminal.
          </>
        ),
        suggest: ['contact', 'resume'],
      };

    case 'sudo':
      return {
        out: (
          <span className="text-red-300">
            adarsh is not in the sudoers file. This incident will be reported.
          </span>
        ),
      };

    case 'rm':
      return {
        out: <span className="text-red-300">rm: permission denied. The portfolio stays.</span>,
      };

    case 'pwd':
      return {
        out:
          window.location.pathname === '/'
            ? '/home/adarsh'
            : `/home/adarsh${window.location.pathname}`,
      };

    case 'echo':
      return { out: arg };

    case 'date':
      return { out: new Date().toString() };

    case 'clear':
    case 'cls':
      return { clear: true };

    case 'exit':
    case 'quit':
    case 'q':
      if (fx.embedded) fx.navigate('/');
      fx.close();
      return {};

    default:
      return {
        out: (
          <span className="text-red-300">
            zsh: command not found: {cmd}
            <Muted> — type help</Muted>
          </span>
        ),
        suggest: ['help'],
      };
  }
}

function complete(value: string) {
  const v = value.trimStart();
  const [cmd, ...rest] = v.split(/\s+/);
  if (rest.length === 0) {
    const match = COMMANDS.filter((c) => c.startsWith(cmd.toLowerCase()));
    return match.length === 1 ? `${match[0]} ` : value;
  }
  if (['cat', 'open'].includes(cmd)) {
    const partial = rest.join(' ').toLowerCase();
    const match = projects.filter((p) => p.slug.startsWith(partial));
    return match.length === 1 ? `${cmd} ${match[0].slug}` : value;
  }
  if (cmd === 'cd') {
    const match = ['work', 'about', 'journal'].filter((d) =>
      d.startsWith(rest.join(' ').toLowerCase()),
    );
    return match.length === 1 ? `cd ${match[0]}` : value;
  }
  if (cmd === 'ls') {
    const match = ['projects', 'experience', 'papers'].filter((d) =>
      d.startsWith(rest.join(' ').toLowerCase()),
    );
    return match.length === 1 ? `ls ${match[0]}` : value;
  }
  return value;
}

type Props = {
  /** Lines shown before the banner hints, e.g. the 404 message. */
  intro?: ReactNode;
  embedded?: boolean;
  onClose?: () => void;
  autoFocus?: boolean;
  initialSuggestions?: string[];
};

export default function TerminalView({
  intro,
  embedded = false,
  onClose,
  autoFocus = false,
  initialSuggestions,
}: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const askAdarsh = useAskAdarsh();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const [suggest, setSuggest] = useState<string[]>(initialSuggestions ?? DEFAULT_SUGGESTIONS);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const nextId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cwd = pathToCwd(pathname);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const exec = (raw: string) => {
    const close = onClose ?? (() => {});
    const result = run(raw, {
      navigate,
      ask: (q) => window.setTimeout(() => askAdarsh.open(q), 0),
      close,
      embedded,
    });
    if (raw.trim()) {
      history.current = [raw.trim(), ...history.current.filter((h) => h !== raw.trim())].slice(
        0,
        30,
      );
    }
    cursor.current = -1;
    setValue('');
    if (result.clear) {
      setLines([]);
      setSuggest(DEFAULT_SUGGESTIONS);
      return;
    }
    const prompt = (
      <>
        <span className="text-emerald-300/90">adarsh@portfolio</span>
        <Muted>:</Muted>
        <span className="text-sky-300/90">{cwd}</span>
        <Muted>$ </Muted>
        {raw}
      </>
    );
    setLines((prev) => [
      ...prev,
      { id: nextId.current++, node: prompt },
      ...(result.out != null ? [{ id: nextId.current++, node: result.out }] : []),
    ]);
    if (result.suggest) setSuggest(result.suggest);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      exec(value);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setValue((v) => complete(v));
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      cursor.current =
        e.key === 'ArrowUp'
          ? Math.min(h.length - 1, cursor.current + 1)
          : Math.max(-1, cursor.current - 1);
      setValue(cursor.current === -1 ? '' : h[cursor.current]);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col font-mono text-[13px] leading-relaxed text-text-primary md:text-sm">
      <div
        ref={scrollRef}
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-4 md:px-5"
        onClick={(e) => {
          // Clicking empty space focuses the prompt on keyboards; on touch it would pop the keyboard.
          if (window.matchMedia('(pointer: fine)').matches && e.target === e.currentTarget)
            inputRef.current?.focus();
        }}
      >
        {intro ? <div className="mb-4 whitespace-pre-wrap break-words">{intro}</div> : null}
        <pre
          className="m-0 select-none overflow-hidden text-[13px] leading-[1.15] text-accent"
          aria-label="Adarsh"
        >
          {BANNER}
        </pre>
        <p className="mt-3 whitespace-pre-wrap">
          <Muted>
            {experience[0].role} · {heroContent.location}
            {'\n'}Type <Acc>help</Acc> for commands, or tap one below.
          </Muted>
        </p>
        <div className="mt-4 space-y-1">
          {lines.map((l) => (
            <div key={l.id} className="terminal-line whitespace-pre-wrap break-words">
              {l.node}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06] bg-black/20">
        <div
          className="flex gap-2 overflow-x-auto px-3 pt-2.5 [scrollbar-width:none]"
          aria-label="Suggested commands"
        >
          {suggest.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => exec(s)}
              className="flex h-9 shrink-0 items-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-xs text-text-primary/90 transition-colors hover:border-accent/40 active:bg-white/[0.08]"
            >
              {s}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 md:px-5">
          <span className="shrink-0 select-none">
            <span className="text-emerald-300/90">~</span>
            <Muted>$</Muted>
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Terminal command"
            placeholder="type a command…"
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 bg-transparent text-base text-text-primary caret-accent outline-none placeholder:text-muted/60 md:text-sm"
          />
          <button
            type="button"
            onClick={() => exec(value)}
            className="flex h-9 shrink-0 items-center rounded-lg px-2.5 text-xs text-muted active:bg-white/[0.08] md:hidden"
          >
            run ↵
          </button>
        </label>
      </div>
    </div>
  );
}
