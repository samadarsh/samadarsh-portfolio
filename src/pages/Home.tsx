import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Stats } from '../components/Stats';
import { SelectedWorks } from '../components/SelectedWorks';
import { SectionHeader } from '../components/SectionHeader';
import { Footer } from '../components/Footer';
import { aboutNarrative } from '../data/content';
import { usePageMeta } from '../hooks/usePageMeta';

export function HomePage() {
  usePageMeta(
    null,
    'Adarsh S — building intelligent systems across AI and markets. Practical AI, data systems, and market research, shipped to production.',
  );

  return (
    <>
      <Hero />
      <Stats />

      <section className="py-24 md:py-32">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid items-start gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <SectionHeader
                kicker="About"
                title="Practical AI,"
                italic="shipped to production."
              />
            </div>
            <div className="space-y-6 text-base leading-relaxed text-muted md:col-span-7 md:text-lg">
              {aboutNarrative.slice(0, 2).map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.6 }}
                >
                  {p}
                </motion.p>
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

      <SelectedWorks limit={3} />

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

      <Footer />
    </>
  );
}
