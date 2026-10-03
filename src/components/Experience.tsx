import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { experience } from '../data/content';
import { unlock } from '../lib/achievements';

export function Experience() {
  const endRef = useRef<HTMLDivElement>(null);

  // Reaching the end of the list unlocks the "Background check" achievement.
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) unlock('background');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="grid gap-12 md:grid-cols-12">
      <div className="md:col-span-4">
        <p className="font-mono text-xs md:text-[11px] uppercase tracking-[0.25em] text-accent">
          Experience
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl">
          Work that mixes <span className="italic">analysis</span> with execution.
        </h3>
        <p className="mt-4 text-sm text-muted md:text-base">
          Roles across machine learning engineering and live financial markets.
        </p>
      </div>

      <ol className="md:col-span-8">
        {experience.map((item, index) => (
          <motion.li
            key={item.company + item.period}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative border-t border-white/[0.06] py-8 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <h4 className="font-display text-2xl tracking-tight text-text-primary md:text-3xl">
                {item.company}
              </h4>
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                {item.period}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-sm font-medium text-accent">{item.role}</span>
              {item.kind ? (
                <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 font-mono text-[11px] md:text-[10px] uppercase tracking-[0.18em] text-muted">
                  {item.kind}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{item.summary}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {item.points.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-muted/60" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ol>
      <div ref={endRef} aria-hidden className="h-px md:col-span-12" />
    </div>
  );
}
