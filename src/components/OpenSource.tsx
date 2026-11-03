import { m } from 'framer-motion';
import { openSource, prUrl, type OpenSourcePr } from '../data/content';

/**
 * The About page's open-source work: pull requests to other people's projects, grouped by
 * project, each with its status and a link to the PR. Laid out like Publications, with the
 * intro on the left and the projects on the right.
 */

const all = openSource.flatMap((p) => p.prs);
const merged = all.filter((pr) => pr.status === 'Merged').length;
const open = all.filter((pr) => pr.status === 'Open').length;

// The status colour sits in the dot and border; the word stays in body colour so it reads at
// 11px in every theme (green and orange text on the light theme's surface fall under 4.5:1).
const badge: Record<OpenSourcePr['status'], { ring: string; dot: string; text: string }> = {
  Merged: { ring: 'border-[rgb(var(--up)/0.45)]', dot: 'bg-[rgb(var(--up))]', text: 'text-text-primary' },
  Open: { ring: 'border-accent/45', dot: 'bg-accent', text: 'text-text-primary' },
  Closed: { ring: 'border-white/[0.12]', dot: 'bg-muted', text: 'text-muted' },
};

export function OpenSource() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="max-w-xl lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
          Open source
        </p>
        <h3 className="mt-3 font-display text-3xl leading-tight tracking-tighter text-text-primary md:text-4xl">
          Fixes, <span className="italic">sent upstream</span>.
        </h3>
        <p className="mt-4 text-sm text-muted md:text-base">
          Bug fixes and docs for projects I use, from IBM&apos;s Granite Switch to OpenAlgo.{' '}
          {merged} merged so far, {open} in review.
        </p>
      </div>

      <m.div
        className="grid gap-4 lg:col-span-8"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {openSource.map((project) => (
          <section
            key={project.repo}
            aria-label={project.name}
            className="rounded-[22px] border border-white/[0.08] bg-surface p-5 md:p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h4 className="font-display text-[22px] leading-tight tracking-tight text-text-primary md:text-2xl">
                {project.name}
              </h4>
              <a
                href={`https://github.com/${project.repo}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-muted transition-colors hover:text-text-primary"
              >
                {project.repo}
              </a>
            </div>
            <p className="mt-1.5 text-sm text-muted">{project.about}</p>

            <ul className="mt-4 divide-y divide-white/[0.06] border-t border-white/[0.06]">
              {project.prs.map((pr) => (
                <li key={pr.number}>
                  <a
                    href={prUrl(project.repo, pr.number)}
                    target="_blank"
                    rel="noreferrer"
                    className="group grid min-h-[44px] grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 py-3 md:grid-cols-[auto_1fr_auto] md:items-baseline md:gap-x-4"
                  >
                    {/* Phones: status and number on their own line, the text below at full width. */}
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-flex w-[5.25rem] items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] ${badge[pr.status].ring} ${badge[pr.status].text}`}
                      >
                        <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${badge[pr.status].dot}`} />
                        {pr.status}
                      </span>
                      <span className="font-mono text-xs text-muted md:hidden">#{pr.number}</span>
                    </span>
                    <span className="col-span-2 row-start-2 text-sm leading-relaxed text-text-primary/90 md:col-span-1 md:row-start-auto md:text-[15px]">
                      <span className="mr-2 hidden font-mono text-xs text-muted md:inline">
                        #{pr.number}
                      </span>
                      {pr.title}
                      {pr.when || pr.note ? (
                        <span className="text-muted"> ·{'\u00a0'}{pr.when ?? pr.note}</span>
                      ) : null}
                    </span>
                    <span
                      aria-hidden
                      className="col-start-2 row-start-1 text-muted transition-colors group-hover:text-accent md:col-start-auto md:row-start-auto"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </m.div>
    </div>
  );
}
