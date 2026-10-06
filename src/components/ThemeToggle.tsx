import { useTheme } from '../hooks/useTheme';
import { playSound } from '../lib/sound';
import { toggleTheme } from '../lib/theme';

/** Sun when the page is dark (switch to light), moon when it is light. */
export function ThemeIcon({ theme, size = 15 }: { theme: 'dark' | 'light'; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {theme === 'dark' ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      ) : (
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
      )}
    </svg>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => {
        toggleTheme();
        playSound('tick');
      }}
      className={`flex items-center justify-center rounded-full border border-white/[0.08] text-muted transition-colors hover:border-accent/40 hover:text-text-primary ${className}`}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <ThemeIcon theme={theme} />
    </button>
  );
}
