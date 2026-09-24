import { SelectedWorks } from '../components/SelectedWorks';
import { Footer } from '../components/Footer';
import { usePageMeta } from '../hooks/usePageMeta';

export function WorkPage() {
  usePageMeta(
    'Work',
    'Selected projects by Adarsh S across AI, product, and markets — RAG systems, developer tools, speech AI, and client work shipped to production.',
  );

  return (
    <>
      <div className="pt-28 md:pt-32">
        <SelectedWorks />
      </div>
      <Footer />
    </>
  );
}
