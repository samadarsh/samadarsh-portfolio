import { motion } from 'framer-motion';
import { journalEntries, writingMeta } from '../data/content';
import { SectionHeader } from '../components/SectionHeader';
import { Footer } from '../components/Footer';
import { usePageMeta } from '../hooks/usePageMeta';

export function JournalPage() {
  usePageMeta(
    'Haugtun Research',
    'Haugtun Research by Adarsh S — notes on Indian markets, investing fundamentals, and how capital moves through cycles.',
  );

  return (
    <>
      <section className="pt-32 md:pt-40">
        <div className="container mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="Writing"
            title="Thoughts from"
            italic="the markets."
            subtitle="Writing about markets, investor behavior, and how capital moves through cycles."
          />

          {/* Haugtun intro card */}
          <motion.a
            href={writingMeta.pageUrl}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group mb-16 block rounded-2xl border border-white/[0.08] bg-surface/40 p-6 transition hover:border-accent/40 hover:bg-surface/60 md:p-8"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                  Research Page · LinkedIn
                </p>
                <h3 className="mt-3 font-display text-2xl tracking-tight text-text-primary md:text-3xl">
                  <span className="italic text-text-primary/90">Haugtun</span> — my market research
                  page
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                  {writingMeta.description}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-text-primary">
                <span>Follow on LinkedIn</span>
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] transition group-hover:translate-x-1 group-hover:border-accent group-hover:text-accent"
                >
                  →
                </span>
              </div>
            </div>
          </motion.a>

          {/* Entries */}
          <ul className="flex flex-col">
            {journalEntries.map((entry, index) => (
              <motion.li
                key={entry.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="border-t border-white/[0.06] last:border-b"
              >
                <a
                  href={entry.href}
                  data-cursor="Read"
                  target="_blank"
                  rel="noreferrer"
                  className="group grid gap-3 py-8 transition md:grid-cols-12 md:gap-8"
                >
                  <div className="flex items-center gap-4 md:col-span-3">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                      {entry.tag}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                      {entry.date}
                    </span>
                  </div>
                  <div className="md:col-span-8">
                    <h3 className="font-display text-2xl tracking-tight text-text-primary transition group-hover:text-accent md:text-[28px]">
                      {entry.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                      {entry.summary}
                    </p>
                  </div>
                  <div className="hidden items-start justify-end pt-2 text-muted md:col-span-1 md:flex">
                    <span className="transition group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </div>
                </a>
              </motion.li>
            ))}
          </ul>

          {/* Bottom CTA */}
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
              New posts published regularly
            </p>
            <a
              href={writingMeta.pageUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 rounded-full border border-white/[0.1] bg-surface/40 px-6 py-3 text-sm font-medium text-text-primary transition hover:border-accent/40 hover:bg-surface/60"
            >
              View all on LinkedIn
              <span
                aria-hidden
                className="transition group-hover:translate-x-1 group-hover:text-accent"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
