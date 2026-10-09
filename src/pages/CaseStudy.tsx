import { useEffect } from 'react';
import { m } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { NotFoundPage, notFoundMeta } from './NotFound';
import { ArchitectureFlow } from '../components/ArchitectureFlow';
import { projects } from '../data/content';
import { ProjectPreview } from '../components/ProjectPreview';
import { Footer } from '../components/Footer';
import { usePageMeta } from '../hooks/usePageMeta';
import { caseStudyMeta } from '../data/seo';
import { sleepsWhenIdle, WAKE_NOTE } from '../lib/demoHost';
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

  const meta = project ? caseStudyMeta(project) : notFoundMeta;
  usePageMeta(meta.title, meta.description);

  useEffect(() => {
    if (project) unlock('casestudy');
  }, [project]);

  if (!project) return <NotFoundPage />;

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
                  aria-describedby={sleepsWhenIdle(project.links.live) ? 'live-wake' : undefined}
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
            {sleepsWhenIdle(project.links.live) ? (
              <p id="live-wake" className="mt-3 text-xs text-muted">
                {WAKE_NOTE}
              </p>
            ) : null}
          </header>

          <div className="mt-12">
            <ProjectPreview
              src={project.cover}
              video={project.video}
              demo={project.demo}
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
              <ArchitectureFlow steps={project.architecture} />
            </m.section>
          ) : null}

          {project.results ? (
            <m.section {...fadeUp} className="mt-16" aria-label="Results">
              <SectionLabel>Results</SectionLabel>
              <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-muted">
                {project.results.setup}
              </p>
              <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                {project.results.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <dt className="mt-2 text-sm text-text-primary">{metric.label}</dt>
                    <dd className="order-first mt-0 font-display text-4xl tracking-tight text-accent md:text-5xl">
                      {metric.value}
                    </dd>
                    {metric.detail ? (
                      <dd className="mt-1 font-mono text-xs text-muted">{metric.detail}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
              {project.results.note ? (
                <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
                  {project.results.note}
                </p>
              ) : null}
              {project.results.source ? (
                <a
                  href={project.results.source.href}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Code"
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm text-text-primary"
                >
                  <span className="border-b border-accent/40 pb-0.5">
                    {project.results.source.label}
                  </span>
                  <span aria-hidden>↗</span>
                </a>
              ) : null}
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
