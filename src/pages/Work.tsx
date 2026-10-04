import { SelectedWorks } from '../components/SelectedWorks';
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
      <Footer />
    </>
  );
}
