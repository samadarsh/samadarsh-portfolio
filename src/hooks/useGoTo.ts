import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scrollToElement } from '../lib/smoothScroll';

/** Navigates to a route and optional section id, scrolling there even when already on that page. */
export function useGoTo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (path: string, sectionId?: string) => {
      if (sectionId && path === pathname) {
        const el = document.getElementById(sectionId);
        if (el) scrollToElement(el);
        // `scrolled` tells the scroll manager not to jump again for this hash change.
        navigate({ hash: sectionId }, { replace: true, state: { scrolled: true } });
        return;
      }
      navigate(sectionId ? `${path}#${sectionId}` : path);
    },
    [navigate, pathname],
  );
}
