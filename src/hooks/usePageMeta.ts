import { useEffect } from 'react';
import { fullTitle } from '../data/seo';

/** Sets the document title and meta description for the current page. */
export function usePageMeta(title: string | null, description: string) {
  useEffect(() => {
    document.title = fullTitle({ title });
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
