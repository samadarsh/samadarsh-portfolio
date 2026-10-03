import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      scrollToElement(target, { immediate: true });
    } else {
      scrollToTop();
    }
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
              <Outlet />
            </main>
            <MobileActionBar />
          </CommandPaletteProvider>
        </AskAdarshProvider>
      </AchievementsProvider>
    </ToastProvider>
  );
}
