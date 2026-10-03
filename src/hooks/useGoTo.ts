import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Navigates to a route and optional section id, scrolling there even when already on that page. */
export function useGoTo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (path: string, sectionId?: string) => {
      if (sectionId && path === pathname) {
        document.getElementById(sectionId)?.scrollIntoView({ block: 'start' });
        navigate({ hash: sectionId }, { replace: true });
        return;
      }
      navigate(sectionId ? `${path}#${sectionId}` : path);
    },
    [navigate, pathname],
  );
}
