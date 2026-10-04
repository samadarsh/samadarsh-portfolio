import { useEffect } from 'react';
import { m } from 'framer-motion';
import { Link, Navigate, useParams } from 'react-router-dom';
import { projects } from '../data/content';
import { ProjectPreview } from '../components/ProjectPreview';
import { Footer } from '../components/Footer';
import { usePageMeta } from '../hooks/usePageMeta';
import { caseStudyMeta, pages } from '../data/seo';
import { unlock } from '../lib/achievements';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
} as const;

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-muted md:text-[11px]">
      {children}
    </h2>
  );
}

export function CaseStudyPage() {
  const { slug } = useParams();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = index >= 0 ? projects[index] : undefined;

  const meta = project ? caseStudyMeta(project) : pages.work;
  usePageMeta(meta.title, meta.description);

  useEffect(() => {
    if (project) unlock('casestudy');
  }, [project]);

  if (!project) return <Navigate to="/work" replace />;

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <article className="pt-28 md:pt-36">
        <div className="container mx-auto max-w-5xl px-6">
          <Link
            to={`/work#${project.slug}`}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted transition-colors hover:text-text-primary"
          >
            <span aria-hidden>←</span> All work
          </Link>

          <header className="mt-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.22em] text-accent md:text-[11px]">
              <span>{project.eyebrow}</span>
              <span className="text-muted">·</span>
              <span className="text-muted">{project.year}</span>
            </div>
            <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tighter text-text-primary md:text-7xl">
              {project.title}
            </h1>
            <p className="mt-3 text-sm font-medium text-muted">{project.role}</p>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">
              {project.summary}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {project.links.live ? (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Live"
                  data-magnetic
                  data-achievement="testdriver"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-text-primary px-5 text-sm font-medium text-bg"
                >
                  View live ↗
                </a>
              ) : null}
              {project.links.github ? (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Code"
                  data-magnetic
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/[0.12] px-5 text-sm font-medium text-text-primary"
                >
                  GitHub ↗
                </a>
              ) : null}
            </div>
          </header>

          <div className="mt-12">
            <ProjectPreview
              src={project.cover}
              video={project.video}
              title={project.title}
              url={project.links.live ?? project.links.github ?? undefined}
              accent={project.accent}
              eyebrow={project.eyebrow}
              priority
            />
          </div>

          {project.architecture?.length ? (
            <m.section {...fadeUp} className="mt-20" aria-labelledby="how-it-works">
              <SectionLabel>How it works</SectionLabel>
              <ol
                id="how-it-works"
                className="mt-6 flex flex-col gap-3 md:grid md:gap-3"
                // One even row on wider screens; the step numbers carry the order there.
                style={{
                  gridTemplateColumns: `repeat(${project.architecture.length}, minmax(0, 1fr))`,
                }}
              >
                {project.architecture.map((step, i) => (
                  <li key={step.label} className="flex flex-col gap-3">
                    {i > 0 ? (
                      <span className="pl-5 text-accent md:hidden" aria-hidden>
                        ↓
                      </span>
                    ) : null}
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 md:h-full">
                      <p className="flex items-baseline gap-2 text-[15px] font-medium text-text-primary">
                        <span className="font-mono text-xs text-accent md:text-[11px]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {step.label}
                      </p>
                      {step.detail ? (
                        <p className="mt-1 text-sm text-muted">{step.detail}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </m.section>
          ) : null}

          <m.section {...fadeUp} className="mt-16" aria-label="Highlights">
            <SectionLabel>Highlights</SectionLabel>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {project.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-2xl border border-white/[0.06] p-5 text-[15px] leading-relaxed text-muted"
                >
                  {h}
                </li>
              ))}
            </ul>
          </m.section>

          <m.section {...fadeUp} className="mt-16" aria-label="Stack">
            <SectionLabel>Stack</SectionLabel>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.stack.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 font-mono text-xs text-text-primary/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          </m.section>

          <nav
            aria-label="More projects"
            className="mt-20 grid gap-3 border-t border-white/[0.06] pt-8 sm:grid-cols-2"
          >
            <Link
              to={`/work/${prev.slug}`}
              className="group rounded-2xl border border-white/[0.06] p-5 transition-colors hover:border-accent/40"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted md:text-[11px]">
                ← Previous
              </span>
              <span className="mt-2 block font-display text-2xl text-text-primary">
                {prev.title}
              </span>
            </Link>
            <Link
              to={`/work/${next.slug}`}
              className="group rounded-2xl border border-white/[0.06] p-5 text-right transition-colors hover:border-accent/40"
            >
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted md:text-[11px]">
                Next →
              </span>
              <span className="mt-2 block font-display text-2xl text-text-primary">
                {next.title}
              </span>
            </Link>
          </nav>
        </div>
      </article>
      <Footer />
    </>
  );
}
