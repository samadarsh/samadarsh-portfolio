import { useEffect } from 'react';

const SITE_NAME = 'Adarsh S';

/** Sets the document title and meta description for the current page. */
export function usePageMeta(title: string | null, description: string) {
  useEffect(() => {
    document.title = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — Building intelligent systems across AI and markets`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
}
