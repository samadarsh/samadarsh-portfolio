import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Navbar } from './Navbar';
import { ToastProvider } from './Toaster';
import { CommandPaletteProvider } from './CommandPalette';
import { useEasterEggs } from '../hooks/useEasterEggs';

function ScrollManager() {
  const { pathname, hash } = useLocation();

  // On navigation, jump to the #section if there is one, otherwise to the top.
  useEffect(() => {
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, hash]);

  return null;
}

function EasterEggs() {
  useEasterEggs();
  return null;
}

export function Layout() {
  return (
    <ToastProvider>
      <CommandPaletteProvider>
        <ScrollManager />
        <EasterEggs />
        <Navbar />
        <main>
          <Outlet />
        </main>
      </CommandPaletteProvider>
    </ToastProvider>
  );
}
