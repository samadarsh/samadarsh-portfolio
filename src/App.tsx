import { useCallback, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { WorkPage } from './pages/Work';
import { AboutPage } from './pages/About';
import { JournalPage } from './pages/Journal';
import { CaseStudyPage } from './pages/CaseStudy';

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

const skipLoader = () =>
  typeof window === 'undefined' ||
  loaderAlreadySeen() ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="work" element={<WorkPage />} />
        <Route path="work/:slug" element={<CaseStudyPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="journal" element={<JournalPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const [ready, setReady] = useState(skipLoader);
  const [showLoader, setShowLoader] = useState(!ready);

  const onLoaderComplete = useCallback(() => {
    markLoaderSeen();
    setReady(true);
  }, []);

  const onLoaderExited = useCallback(() => setShowLoader(false), []);

  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={basename}>
        {showLoader ? (
          <LoadingScreen onComplete={onLoaderComplete} onExited={onLoaderExited} />
        ) : null}
        {ready ? <AppRoutes /> : null}
        <SpeedInsights />
      </BrowserRouter>
    </MotionConfig>
  );
}
