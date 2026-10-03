import { motion } from 'framer-motion';
import { education, skillGroups } from '../data/content';

export function Skills() {
  return (
    <div className="grid gap-16 md:grid-cols-12">
      <div className="md:col-span-4">
        <p className="font-mono text-xs md:text-[11px] uppercase tracking-[0.25em] text-accent">
          Skills & Education
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl">
          A stack built around <span className="italic">applied</span> AI and data.
        </h3>
        <p className="mt-4 text-sm text-muted md:text-base">
          Foundations from formal study, sharpened by shipping real projects.
        </p>
      </div>

      <div className="md:col-span-8">
        <div className="grid gap-8 md:grid-cols-2">
          {skillGroups.map((group, index) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
            >
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {group.title}
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-sm text-text-primary/90"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14">
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Education
          </h4>
          <ul className="mt-4 space-y-6">
            {education.map((item) => (
              <li key={item.school + item.period}>
                <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
                  <h5 className="font-display text-xl tracking-tight text-text-primary">
                    {item.degree}
                  </h5>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted">
                    {item.period}
                  </span>
                </div>
                <p className="text-sm font-medium text-accent">{item.school}</p>
                <p className="mt-2 text-sm text-muted">{item.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
