import { m } from 'framer-motion';
import { stats } from '../data/content';

export function Stats() {
  return (
    <section className="border-y border-white/[0.06] py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-y-12 md:grid-cols-4 md:gap-y-0">
          {stats.map((stat, index) => (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="border-l border-white/[0.06] pl-6 odd:border-l-0 odd:pl-0 md:[&:nth-child(3)]:border-l md:[&:nth-child(3)]:pl-6"
            >
              <p className="font-display text-5xl leading-none tracking-tighter text-text-primary md:text-6xl">
                {stat.value}
              </p>
              <p className="mt-3 font-mono text-xs md:text-[11px] uppercase tracking-[0.2em] text-muted">
                {stat.label}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
