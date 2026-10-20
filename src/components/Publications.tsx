import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { publications, type Publication } from '../data/content';
import { useBackToClose } from '../hooks/useBackToClose';
import { lockScroll } from '../lib/smoothScroll';

/**
 * The About page's research, laid out like Apple's "Get to know" galleries: one tall card per
 * paper with a small drawing of what it does, and a + that opens a sheet with the full title,
 * where it was published and presented, and its topics. A snap-scrolling row on phones, side by
 * side on wider screens. The drawings play once when the row first comes into view.
 */

const kindLabel = (p: Publication) =>
  p.venues.map((v) => (v.kind === 'Journal' ? 'Journal paper' : 'Conference talk')).join(' · ');

export function Publications() {
  const [open, setOpen] = useState<Publication | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useBackToClose(open !== null, close);
  const rowRef = useRef<HTMLOListElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(row);
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="max-w-xl lg:col-span-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
          Publications
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl">
          Research, <span className="italic">published</span> and presented.
        </h3>
        <p className="mt-4 text-sm text-muted md:text-base">
          Applied deep learning research: one journal paper and two international conference
          presentations. Open a paper for where it appeared.
        </p>
      </div>

      <ol
        ref={rowRef}
        className={`pub-row -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2 lg:col-span-8 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 ${seen ? 'pub-seen' : ''}`}
        aria-label="Publications"
      >
        {publications.map((pub) => (
          <li
            key={pub.title}
            className="pub-card group relative flex w-[82%] flex-shrink-0 snap-start flex-col overflow-hidden rounded-[22px] border border-white/[0.08] bg-surface transition-[border-color,transform] duration-300 md:hover:-translate-y-1 md:hover:border-accent/40 min-[480px]:w-[60%] md:w-auto"
          >
            <div className="px-5 pt-5 md:px-6 md:pt-6">
              <p className="text-xs font-medium text-muted">
                {kindLabel(pub)}
                {pub.year ? ` · ${pub.year}` : ''}
              </p>
              <h4 className="mt-2 font-display text-[22px] leading-[1.15] tracking-tight text-text-primary md:text-2xl">
                {pub.short}
              </h4>
            </div>
            <div className="relative m-4 mt-5 min-h-[210px] flex-1 overflow-hidden rounded-2xl bg-bg/60 md:m-5 md:min-h-[230px]">
              {pub.figure === 'food' ? <FoodFigure /> : <MusicFigure />}
            </div>
            {/* Covers the card, so a tap anywhere opens the sheet; the + is its visible handle. */}
            <button
              type="button"
              onClick={() => setOpen(pub)}
              aria-haspopup="dialog"
              data-cursor="Open"
              aria-label={`More about ${pub.title}`}
              className="absolute inset-0 z-10 rounded-[22px]"
            >
              <span
                aria-hidden
                className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-text-primary text-xl leading-none text-bg transition-colors group-hover:bg-accent md:bottom-7 md:right-7 md:h-9 md:w-9"
              >
                +
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* In <body>, so a page transition's transform can't trap the fixed overlay. */}
      {createPortal(
        <AnimatePresence>{open ? <PaperSheet pub={open} onClose={close} /> : null}</AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

/** A plate with two recognition boxes, and nutrient bars that fill in. */
function FoodFigure() {
  return (
    <div aria-hidden className="pub-food absolute inset-0">
      <div className="pub-plate" />
      <span className="pub-box" style={{ left: 'calc(50% - 58px)', top: 'calc(50% - 46px)', width: 56, height: 48 }}>
        <b>detected</b>
      </span>
      <span className="pub-box" style={{ left: 'calc(50% + 6px)', top: 'calc(50% - 4px)', width: 50, height: 44 }}>
        <b>detected</b>
      </span>
      <div className="pub-nutri">
        <span>nutrients</span>
        <i style={{ width: 72 }} />
        <i style={{ width: 48 }} />
        <i style={{ width: 60 }} />
      </div>
    </div>
  );
}

const WAVE = Array.from({ length: 34 }, (_, i) => 18 + Math.abs(Math.sin(i * 0.9) * 46 + Math.sin(i * 2.3) * 14));

/** A waveform that resolves into genre scores, one clearly ahead. */
function MusicFigure() {
  return (
    <div aria-hidden className="pub-music absolute inset-0">
      <div className="pub-wave">
        {WAVE.map((h, i) => (
          <i key={i} style={{ height: h }} />
        ))}
      </div>
      <div className="pub-genres">
        <span>genre</span>
        <b className="pub-on" style={{ width: '82%' }} />
        <span />
        <b style={{ width: '44%' }} />
        <span />
        <b style={{ width: '26%' }} />
      </div>
    </div>
  );
}

function PaperSheet({ pub, onClose }: { pub: Publication; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

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

  const journal = pub.venues.filter((v) => v.kind === 'Journal');
  const talks = pub.venues.filter((v) => v.kind === 'Conference');

  return (
    <m.div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:p-6"
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
        aria-labelledby="paper-title"
        className="max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl border border-white/[0.1] bg-surface p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)] md:max-w-2xl md:rounded-3xl md:p-8"
        data-lenis-prevent
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/[0.12] md:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted">
              {kindLabel(pub)}
              {pub.year ? ` · ${pub.year}` : ''}
            </p>
            <h2
              id="paper-title"
              className="mt-2 font-display text-[26px] leading-[1.12] tracking-tight text-text-primary md:text-[32px]"
            >
              {pub.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-text-primary text-bg transition-colors hover:bg-accent md:h-9 md:w-9"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          <p className="rounded-2xl bg-bg/60 p-4 text-sm leading-relaxed text-muted md:p-5 md:text-[15px]">
            <span className="font-semibold text-text-primary">What it does. </span>
            {pub.summary}
          </p>
          {journal.length ? (
            <p className="rounded-2xl bg-bg/60 p-4 text-sm leading-relaxed text-muted md:p-5 md:text-[15px]">
              <span className="font-semibold text-text-primary">Published in </span>
              {journal.map((v) => v.name).join('; ')}.
            </p>
          ) : null}
          {talks.length ? (
            <p className="rounded-2xl bg-bg/60 p-4 text-sm leading-relaxed text-muted md:p-5 md:text-[15px]">
              <span className="font-semibold text-text-primary">
                {journal.length ? 'Also presented at the ' : 'Presented at the '}
              </span>
              {talks.map((v) => v.name).join('; ')}.
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {pub.topics.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-muted md:text-[11px]"
            >
              {t}
            </span>
          ))}
          {pub.href ? (
            <a
              href={pub.href}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/[0.1] px-4 text-sm text-text-primary transition-colors hover:border-accent/50"
            >
              Read the paper <span aria-hidden>↗</span>
            </a>
          ) : null}
        </div>
      </m.section>
    </m.div>
  );
}
