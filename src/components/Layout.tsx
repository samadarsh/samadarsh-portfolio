import { Outlet, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { waitForElement } from '../lib/waitForElement';
import { CustomCursor } from './CustomCursor';
import { MobileActionBar } from './MobileActionBar';
import { scrollToElement, scrollToTop, startSmoothScroll } from '../lib/smoothScroll';
import { Navbar } from './Navbar';
import { ToastProvider } from './Toaster';
import { CommandPaletteProvider } from './CommandPalette';
import { AchievementsProvider } from './Achievements';
import { AskAdarshProvider } from './AskAdarsh';
import { useEasterEggs } from '../hooks/useEasterEggs';

function ScrollManager() {
  const { pathname, hash, state } = useLocation();

  useEffect(() => startSmoothScroll(), []);

  // On navigation, jump to the #section if there is one, otherwise to the top.
  useEffect(() => {
    if ((state as { scrolled?: boolean } | null)?.scrolled) return;
    scrollToTop();
    if (!hash) return;
    // The page may still be loading, so wait for the section before jumping to it.
    const wait = waitForElement(decodeURIComponent(hash.slice(1)));
    wait.promise.then((target) => target && scrollToElement(target, { immediate: true }));
    return wait.cancel;
  }, [pathname, hash, state]);

  return null;
}

function EasterEggs() {
  useEasterEggs();
  return null;
}

export function Layout() {
  return (
    <ToastProvider>
      <AchievementsProvider>
        <AskAdarshProvider>
          <CommandPaletteProvider>
            <ScrollManager />
            <EasterEggs />
            <CustomCursor />
            <Navbar />
            <main>
              {/* Pages other than Home load on demand; hold their space while they arrive. */}
              <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
                <Outlet />
              </Suspense>
            </main>
            <MobileActionBar />
          </CommandPaletteProvider>
        </AskAdarshProvider>
      </AchievementsProvider>
    </ToastProvider>
  );
}
