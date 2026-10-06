import { Fragment } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { AttentionMatrix } from '../components/AttentionMatrix';
import { SelectedWorks } from '../components/SelectedWorks';
import { AgentDemo } from '../components/AgentDemo';
import { SectionHeader } from '../components/SectionHeader';
import { Footer } from '../components/Footer';
import { aboutNarrative, stats } from '../data/content';
import { audienceViews, type HomeSection } from '../data/audiences';
import { useAudience } from '../hooks/useAudience';
import { usePageMeta } from '../hooks/usePageMeta';
import { pages } from '../data/seo';

export function HomePage() {
  usePageMeta(pages.home.title, pages.home.description);
  const view = audienceViews[useAudience()];

  const sections: Record<HomeSection, JSX.Element> = {
    facts: <QuickFacts />,
    matrix: <AttentionMatrix />,
    about: <AboutTeaser />,
    works: (
      <>
        <SelectedWorks slugs={view.projects} subtitle={view.worksSubtitle} />
        <section className="pb-24">
          <div className="container mx-auto max-w-6xl px-6 text-center">
            <Link
              to="/work"
              data-magnetic
              className="group inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] px-6 py-3 text-sm font-medium text-text-primary backdrop-blur transition hover:border-accent/40"
            >
              View all projects
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </section>
      </>
    ),
    agent: <AgentDemo />,
  };

  return (
    <>
      <Hero />
      {/* Order follows "Viewing as"; keys keep each section mounted while it moves. */}
      {view.order.map((id) => (
        <Fragment key={id}>{sections[id]}</Fragment>
      ))}
      <Footer />
    </>
  );
}

function AboutTeaser() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionHeader kicker="About" title="Practical AI," italic="shipped to production." />
          </div>
          <div className="space-y-6 text-base leading-relaxed text-muted md:col-span-7 md:text-lg">
            {aboutNarrative.slice(0, 2).map((p, i) => (
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
            <Link
              to="/about"
              className="group inline-flex items-center gap-2 py-3 text-sm font-medium text-text-primary"
            >
              <span className="border-b border-accent/40 pb-0.5 transition-colors group-hover:border-accent">
                More about me
              </span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The recruiter's quick read: the numbers, before anything else. */
function QuickFacts() {
  return (
    <section className="border-b border-white/[0.06] py-14 md:py-16">
      <div className="container mx-auto max-w-6xl px-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl leading-none tracking-tighter text-text-primary md:text-5xl">
                {stat.value}
              </dd>
              <dd className="mt-2.5 font-mono text-xs uppercase tracking-[0.16em] text-muted md:text-[11px]">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
