import { useCallback, useEffect, useRef, useState } from 'react';
import { useBackToClose } from '../hooks/useBackToClose';
import { NavLink, useLocation } from 'react-router-dom';
import { useCommandPalette } from './CommandPalette';
import { useTerminal } from './Terminal';
import { isMac } from '../lib/contact';
import { playSound, setSoundOn } from '../lib/sound';
import { useSoundOn } from '../hooks/useSound';
import { ResumeButton } from './ContactActions';
import { AchievementsButton } from './Achievements';
import { socialLinks } from '../data/content';
import { useGoTo } from '../hooks/useGoTo';
import { useTheme } from '../hooks/useTheme';
import { toggleTheme } from '../lib/theme';
import { ThemeIcon, ThemeToggle } from './ThemeToggle';

const links = [
  { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' },
  { to: '/journal', label: 'Haugtun Research' },
] as const;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? 'text-text-primary' : 'text-muted hover:text-text-primary'}`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);
  useBackToClose(open, closeMenu);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const palette = useCommandPalette();
  const terminal = useTerminal();
  const soundOn = useSoundOn();
  const goTo = useGoTo();
  const theme = useTheme();

  const toggleSound = () => {
    setSoundOn(!soundOn);
    if (!soundOn) playSound('tick');
  };

  // Close the mobile menu on any navigation (including the logo link).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape or a tap outside the nav/menu.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="pointer-events-none fixed inset-x-0 top-[max(1.25rem,env(safe-area-inset-top))] z-50 flex justify-center px-4"
    >
      <nav
        className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-2 rounded-full border border-white/[0.08] bg-bg/70 px-2 py-2 shadow-2xl backdrop-blur-2xl md:px-3"
        aria-label="Primary"
      >
        <NavLink
          to="/"
          className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] font-mono text-xs font-semibold tracking-tight md:h-9 md:w-9"
          aria-label="Home"
        >
          <span className="relative z-10 transition-colors group-hover:text-bg">AS</span>
          <span className="accent-gradient absolute inset-0 scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        </NavLink>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <AchievementsButton className="h-11 w-11 md:h-9 md:w-9" />
          {/* On phones the theme switch lives in the menu, so the bar keeps four buttons. */}
          <ThemeToggle className="hidden md:flex md:h-9 md:w-9" />
          <button
            type="button"
            onClick={toggleSound}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] text-muted transition-colors hover:border-accent/40 hover:text-text-primary md:h-9 md:w-9"
            aria-pressed={soundOn}
            aria-label="Interface sounds"
            title={soundOn ? 'Sound on' : 'Sound off'}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M11 5 6 9H3v6h3l5 4z" />
              {soundOn ? (
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              ) : (
                <path d="m22 9-6 6M16 9l6 6" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={palette.open}
            className="hidden h-9 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-sm text-muted transition-colors hover:border-accent/40 hover:text-text-primary md:inline-flex"
            aria-label="Open command palette"
          >
            <span>Search</span>
            <kbd className="rounded border border-white/[0.12] px-1.5 font-mono text-[11px] md:text-[10px] text-text-primary">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
          <button
            type="button"
            onClick={palette.open}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] text-muted md:hidden"
            aria-label="Open command palette"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <span className="relative flex h-3 w-4 flex-col justify-between">
              <span
                className={`block h-px w-full bg-text-primary transition ${open ? 'translate-y-[5.5px] rotate-45' : ''}`}
              />
              <span
                className={`block h-px w-full bg-text-primary transition ${open ? '-translate-y-[5.5px] -rotate-45' : ''}`}
              />
            </span>
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          className="pointer-events-auto fixed inset-x-4 top-[calc(max(1.25rem,env(safe-area-inset-top))+4.25rem)] z-40 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-white/[0.08] bg-bg/95 p-3 shadow-2xl backdrop-blur-2xl md:hidden"
          data-lenis-prevent
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-[52px] items-center justify-between rounded-2xl px-4 font-display text-2xl tracking-tight active:bg-white/[0.05] ${
                      isActive ? 'text-text-primary' : 'text-text-primary/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{link.label}</span>
                      {isActive ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  goTo(pathname, 'contact');
                }}
                className="flex min-h-[52px] w-full items-center rounded-2xl px-4 text-left font-display text-2xl tracking-tight text-text-primary/80 active:bg-white/[0.05]"
              >
                Contact
              </button>
            </li>
          </ul>

          <div className="mt-2 flex flex-wrap gap-2 border-t border-white/[0.06] px-1 pt-4">
            <ResumeButton />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                palette.open();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-5 py-3 text-sm text-text-primary"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                terminal.open();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-5 py-3 font-mono text-sm text-text-primary"
            >
              &gt;_ Terminal
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-5 py-3 text-sm text-text-primary"
            >
              <ThemeIcon theme={theme} />
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
          <div className="flex gap-6 px-4 pb-2 pt-4 text-sm text-muted">
            {socialLinks
              .filter((l) => l.label !== 'Email')
              .map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="py-2">
                  {l.label} ↗
                </a>
              ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
