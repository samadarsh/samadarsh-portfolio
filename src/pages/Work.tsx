import { SelectedWorks } from '../components/SelectedWorks';
import { ContinueCard } from '../components/ContinueCard';
import { Footer } from '../components/Footer';
import { usePageMeta } from '../hooks/usePageMeta';
import { pages } from '../data/seo';

export function WorkPage() {
  usePageMeta(pages.work.title, pages.work.description);

  return (
    <>
      <div className="pt-28 md:pt-32">
        <SelectedWorks />
      </div>
      <ContinueCard
        to="/about"
        title="Who built these"
        teaser="Experience, research papers and the stack behind the projects."
      />
      <Footer />
    </>
  );
}
