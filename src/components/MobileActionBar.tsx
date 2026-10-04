import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { contact } from '../data/content';
import { waitForElement } from '../lib/waitForElement';
import { downloadResume } from '../lib/contact';
import { useCommandPalette } from './CommandPalette';
import { useToast } from './Toaster';
import { useAskAdarsh } from './AskAdarsh';
import { AgentGlyph } from './AgentGlyph';

/**
 * Phone-only quick actions pinned to the bottom of the screen. Appears once the visitor has
 * scrolled past the first screen and steps aside when the contact section is on screen.
 */
export function MobileActionBar() {
  const { pathname } = useLocation();
  const palette = useCommandPalette();
  const toast = useToast();
  const askAdarsh = useAskAdarsh();
  const [scrolledPast, setScrolledPast] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolledPast(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const wait = waitForElement('contact');
    wait.promise.then((target) => {
      if (!target) return;
      observer = new IntersectionObserver(([entry]) => setContactVisible(entry.isIntersecting), {
        rootMargin: '0px 0px -20% 0px',
      });
      observer.observe(target);
    });
    return () => {
      wait.cancel();
      observer?.disconnect();
    };
  }, [pathname]);

  const show = scrolledPast && !contactVisible;

  return (
    <AnimatePresence>
      {show ? (
        <m.nav
          aria-label="Quick actions"
          initial={{ y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 96, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-4 gap-1.5 rounded-2xl border border-white/[0.1] bg-surface/90 p-1.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl md:hidden"
        >
          <a
            href={`mailto:${contact.email}`}
            data-achievement="contact"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-text-primary text-sm font-medium text-bg"
          >
            Email
          </a>
          <button
            type="button"
            onClick={() => {
              downloadResume();
              toast({ title: 'Downloading resume', description: contact.resumeFile, icon: '📄' });
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm text-text-primary active:bg-white/[0.06]"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={() => askAdarsh.open()}
            className="flex h-12 items-center justify-center gap-1.5 rounded-xl text-sm text-text-primary active:bg-white/[0.06]"
          >
            <AgentGlyph size={16} className="text-accent" />
            Ask
          </button>
          <button
            type="button"
            onClick={palette.open}
            className="flex h-12 items-center justify-center gap-2 rounded-xl text-sm text-text-primary active:bg-white/[0.06]"
          >
            Search
          </button>
        </m.nav>
      ) : null}
    </AnimatePresence>
  );
}
