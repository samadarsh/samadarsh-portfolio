import { lazy, useCallback, useEffect, useState } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { LoadingScreen } from './components/LoadingScreen';
import { markIntroDone } from './lib/intro';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';

// Home ships in the main bundle; other pages load on demand (and are prefetched once idle).
const loadWork = () => import('./pages/Work').then((m) => ({ default: m.WorkPage }));
const loadAbout = () => import('./pages/About').then((m) => ({ default: m.AboutPage }));
const loadJournal = () => import('./pages/Journal').then((m) => ({ default: m.JournalPage }));
const loadCaseStudy = () => import('./pages/CaseStudy').then((m) => ({ default: m.CaseStudyPage }));
const NotFoundPage = lazy(() =>
  import('./pages/NotFound').then((m) => ({ default: m.NotFoundPage })),
);
const WorkPage = lazy(loadWork);
const AboutPage = lazy(loadAbout);
const JournalPage = lazy(loadJournal);
const CaseStudyPage = lazy(loadCaseStudy);

function usePrefetchPages() {
  useEffect(() => {
    const prefetch = () =>
      [loadWork, loadAbout, loadJournal, loadCaseStudy].forEach((load) => load());
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(prefetch, { timeout: 4000 })
      : window.setTimeout(prefetch, 2500);
    return () =>
      window.cancelIdleCallback ? window.cancelIdleCallback(idle) : window.clearTimeout(idle);
  }, []);
}

const loadMotionFeatures = () => import('./lib/motionFeatures').then((m) => m.default);

const LOADER_KEY = 'portfolio-loaded';

// sessionStorage can throw (e.g. storage blocked), so never let it break the app.
const loaderAlreadySeen = () => {
  try {
    return sessionStorage.getItem(LOADER_KEY) === '1';
  } catch {
    return false;
  }
};

const markLoaderSeen = () => {
  try {
    sessionStorage.setItem(LOADER_KEY, '1');
  } catch {
    // ignore
  }
};

// The intro loader is skipped on phones, for repeat visits and under reduced motion.
const skipLoader = () =>
  typeof window === 'undefined' ||
  loaderAlreadySeen() ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  window.matchMedia('(max-width: 767px)').matches;

function AppRoutes() {
  usePrefetchPages();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="work/:slug" element={<CaseStudyPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [ready, setReady] = useState(skipLoader);
  const [showLoader, setShowLoader] = useState(!ready);
  if (!showLoader) markIntroDone();

  const onLoaderComplete = useCallback(() => {
    markLoaderSeen();
    setReady(true);
  }, []);

  const onLoaderExited = useCallback(() => {
    markIntroDone();
    setShowLoader(false);
  }, []);

  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    // `strict` makes any leftover `motion.*` component throw, so nothing bypasses lazy loading.
    <LazyMotion features={loadMotionFeatures} strict>
      <MotionConfig reducedMotion="user">
        <BrowserRouter basename={basename}>
          {showLoader ? (
            <LoadingScreen onComplete={onLoaderComplete} onExited={onLoaderExited} />
          ) : null}
          {ready ? <AppRoutes /> : null}
          <SpeedInsights />
          {/* Page views, cookie-less. Needs Web Analytics enabled in the Vercel project. */}
          <Analytics />
        </BrowserRouter>
      </MotionConfig>
    </LazyMotion>
  );
}
