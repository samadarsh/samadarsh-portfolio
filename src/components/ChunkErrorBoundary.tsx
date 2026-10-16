import { Component, type ReactNode } from 'react';

/**
 * Last line of defence for a part of the site that failed to load (see lib/chunkRecovery.ts):
 * a short message and a Reload button instead of a blank screen.
 */
export class ChunkErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-bg px-6 text-center">
        <div className="max-w-sm">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent md:text-[11px]">
            Connection hiccup
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-text-primary">
            Part of the page didn’t load.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The site may have just been updated, or the connection dropped for a moment. Reloading
            fetches the latest version.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-text-primary px-6 text-sm font-medium text-bg"
          >
            Reload
          </button>
        </div>
      </main>
    );
  }
}
