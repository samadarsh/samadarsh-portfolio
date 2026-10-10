import { m } from 'framer-motion';
import { GitHubActivity } from '../components/GitHubActivity';
import { SectionHeader } from '../components/SectionHeader';
import { TrainingRun } from '../components/TrainingRun';
import { Skills } from '../components/Skills';
import { Publications } from '../components/Publications';
import { Footer } from '../components/Footer';
import { aboutNarrative, heroContent } from '../data/content';
import { usePageMeta } from '../hooks/usePageMeta';
import { pages } from '../data/seo';

export function AboutPage() {
  usePageMeta(pages.about.title, pages.about.description);

  return (
    <>
      <section className="pt-32 md:pt-40">
        <div className="container mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="About"
            title="An AI engineer building"
            italic="agents, RAG and speech AI."
          />

          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="space-y-6 text-base leading-relaxed text-muted md:pt-6 md:text-lg">
                {aboutNarrative.map((p, i) => (
                  <m.p
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.6 }}
                  >
                    {p}
                  </m.p>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:col-span-5">
              <p className="font-mono text-xs md:text-[11px] uppercase tracking-[0.25em] text-muted">
                Currently
              </p>
              <ul className="mt-4 space-y-4 text-sm text-text-primary md:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                  <span>AI Engineer at Neeroma Technologies, building agents for Yantra.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                  <span>Based in {heroContent.location}.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                  <span>Open to roles, freelance, and research collaborations.</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section id="experience" className="scroll-mt-20 py-24 md:py-32">
        <div className="container mx-auto max-w-6xl px-6">
          <TrainingRun />
        </div>
      </section>

      <section id="publications" className="scroll-mt-20 pb-24 md:pb-32">
        <div className="container mx-auto max-w-6xl px-6">
          <Publications />
        </div>
      </section>

      <GitHubActivity />

      <section className="pb-24 md:pb-32">
        <div className="container mx-auto max-w-6xl px-6">
          <Skills />
        </div>
      </section>

      <Footer />
    </>
  );
}
