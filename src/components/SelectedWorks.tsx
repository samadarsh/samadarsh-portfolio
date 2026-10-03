import { motion } from 'framer-motion';
import { projects } from '../data/content';
import { SectionHeader } from './SectionHeader';
import { ProjectPreview } from './ProjectPreview';

type SelectedWorksProps = {
  showHeader?: boolean;
  limit?: number;
};

const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
  >
    <path
      d="M3 11L11 3M11 3H4M11 3V10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function SelectedWorks({ showHeader = true, limit }: SelectedWorksProps) {
  const items = limit ? projects.slice(0, limit) : projects;

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        {showHeader ? (
          <SectionHeader
            kicker="Selected Works"
            title="Projects across AI,"
            italic="product, and markets."
            subtitle="A few of the systems I've shipped recently — each one built for production, not as a demo."
          />
        ) : null}

        <div className="flex flex-col gap-24 md:gap-32">
          {items.map((project, index) => {
            const reverse = index % 2 === 1;
            return (
              <motion.article
                key={project.slug}
                id={project.slug}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                className="grid scroll-mt-28 grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14"
              >
                <div className={`lg:col-span-7 ${reverse ? 'lg:order-2' : ''}`}>
                  <ProjectPreview
                    src={project.cover}
                    title={project.title}
                    url={project.links.live ?? undefined}
                    accent={project.accent}
                    eyebrow={project.eyebrow}
                    priority={index === 0}
                  />
                </div>

                <div className={`lg:col-span-5 ${reverse ? 'lg:order-1' : ''}`}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                    <span>{project.eyebrow}</span>
                    <span className="text-muted">·</span>
                    <span className="text-muted">{project.year}</span>
                  </div>

                  <h3 className="mt-4 font-display text-4xl leading-[1.05] tracking-tighter text-text-primary md:text-5xl">
                    {project.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-muted">{project.role}</p>

                  <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">
                    {project.summary}
                  </p>

                  <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-muted">
                    {project.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3">
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.stack.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    {project.links.live ? (
                      <a
                        href={project.links.live}
                        data-cursor="Live"
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 text-sm font-medium text-text-primary"
                      >
                        <span className="border-b border-accent/40 pb-0.5 transition-colors group-hover:border-accent">
                          View live
                        </span>
                        <ArrowIcon />
                      </a>
                    ) : null}
                    {project.links.github ? (
                      <a
                        href={project.links.github}
                        data-cursor="Code"
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text-primary"
                      >
                        <span>GitHub</span>
                        <ArrowIcon />
                      </a>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
