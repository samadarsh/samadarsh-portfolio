import { motion } from 'framer-motion';
import { SectionHeader } from '../components/SectionHeader';
import { Experience } from '../components/Experience';
import { Skills } from '../components/Skills';
import { Footer } from '../components/Footer';
import { aboutNarrative, heroContent } from '../data/content';
import { usePageMeta } from '../hooks/usePageMeta';

export function AboutPage() {
  usePageMeta(
    'About',
    'About Adarsh S — AI engineer in Chennai, India, with experience across machine learning engineering and live financial markets.',
  );

  return (
    <>
      <section className="pt-32 md:pt-40">
        <div className="container mx-auto max-w-6xl px-6">
          <SectionHeader
            kicker="About"
            title="Exploring intelligence through"
            italic="systems, software, and markets."
          />

          <div className="grid items-start gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="space-y-6 text-base leading-relaxed text-muted md:pt-6 md:text-lg">
                {aboutNarrative.map((p, i) => (
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
              </div>
            </div>

            <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Currently
              </p>
              <ul className="mt-4 space-y-4 text-sm text-text-primary md:text-base">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                  <span>Building applied AI tools and analytics systems.</span>
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

      <section className="py-24 md:py-32">
        <div className="container mx-auto max-w-6xl px-6">
          <Experience />
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container mx-auto max-w-6xl px-6">
          <Skills />
        </div>
      </section>

      <Footer />
    </>
  );
}
