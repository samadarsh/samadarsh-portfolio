import { m } from 'framer-motion';
import { publications } from '../data/content';

export function Publications() {
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
      <div className="md:col-span-4">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
          Publications
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl">
          Research, <span className="italic">published</span> and presented.
        </h3>
        <p className="mt-4 text-sm text-muted md:text-base">
          Applied deep learning research: one journal paper and two international conference
          presentations.
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-4 md:col-span-8">
        {publications.map((pub, index) => (
          <m.li
            key={pub.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-7"
          >
            <div className="flex flex-wrap gap-2">
              {pub.venues.map((v) => (
                <span
                  key={v.name}
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.18em] md:text-[10px] ${
                    v.kind === 'Journal'
                      ? 'border-accent/40 bg-accent/[0.08] text-accent'
                      : 'border-white/[0.1] text-muted'
                  }`}
                >
                  {v.kind === 'Journal' ? 'Journal paper' : 'Conference talk'}
                </span>
              ))}
            </div>

            <h4 className="mt-4 font-display text-2xl leading-snug tracking-tight text-text-primary md:text-[28px]">
              {pub.href ? (
                <a
                  href={pub.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  {pub.title} <span aria-hidden>↗</span>
                </a>
              ) : (
                pub.title
              )}
            </h4>

            <ul className="mt-4 space-y-2 text-sm text-muted">
              {pub.venues.map((v) => (
                <li key={v.name} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted/60" />
                  <span>
                    {v.kind === 'Journal' ? 'Published in ' : 'Presented at the '}
                    <span className="text-text-primary/85">{v.name}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              {pub.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-muted md:text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </m.li>
        ))}
      </ol>
    </div>
  );
}
