import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/about', label: 'About' },
  { to: '/work', label: 'Work' },
  { to: '/journal', label: 'Haugtun Research' },
] as const;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm transition-colors ${isActive ? 'text-text-primary' : 'text-muted hover:text-text-primary'}`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

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
      className="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <nav
        className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-2 rounded-full border border-white/[0.08] bg-bg/70 px-2 py-2 shadow-2xl backdrop-blur-2xl md:px-3"
        aria-label="Primary"
      >
        <NavLink
          to="/"
          className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/[0.08] font-mono text-xs font-semibold tracking-tight"
          aria-label="Home"
        >
          <span className="relative z-10 transition-colors group-hover:text-bg">AS</span>
          <span className="accent-gradient absolute inset-0 scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
        </NavLink>

        <ul className="hidden items-center gap-8 pr-3 md:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] md:hidden"
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
      </nav>

      {open ? (
        <div
          id="mobile-menu"
          className="pointer-events-auto fixed inset-x-4 top-20 z-40 rounded-3xl border border-white/[0.08] bg-bg/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="block text-lg text-text-primary"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
