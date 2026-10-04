import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { DemoKind } from '../data/content';

// Loaded on demand so the Home bundle stays small.
const ProjectDemo = lazy(() => import('./ProjectDemo'));

type ProjectPreviewProps = {
  src?: string;
  /** Optional muted clip; plays while the preview is active. */
  video?: string;
  /** Animated demo used when there's no screenshot. */
  demo?: DemoKind;
  title: string;
  url?: string;
  accent: string;
  eyebrow?: string;
  className?: string;
  priority?: boolean;
};

const safeHostname = (url?: string) => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

/**
 * "Active" while hovered on mouse devices, or while mostly on screen on touch devices,
 * so phones get the same motion as desktop without needing hover.
 */
function usePreviewActive() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const on = () => setActive(true);
      const off = () => setActive(false);
      el.addEventListener('pointerenter', on);
      el.addEventListener('pointerleave', off);
      return () => {
        el.removeEventListener('pointerenter', on);
        el.removeEventListener('pointerleave', off);
      };
    }

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.6,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, active };
}

export function ProjectPreview({
  src,
  video,
  demo,
  title,
  url,
  accent,
  eyebrow,
  className = '',
  priority = false,
}: ProjectPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const { ref, active } = usePreviewActive();

  const hostname = safeHostname(url);
  const resolvedSrc = src ? asset(src) : undefined;
  const showImage = resolvedSrc && !errored;

  return (
    <div
      ref={ref}
      className={`group/preview relative overflow-hidden rounded-2xl border border-white/[0.06] bg-bg shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)] transition-transform duration-500 hover:-translate-y-1 ${className}`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-surface/80 px-4 py-2.5 backdrop-blur">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        {hostname ? (
          <span className="ml-auto truncate rounded-md bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs md:text-[11px] tracking-tight text-muted">
            {hostname}
          </span>
        ) : eyebrow ? (
          <span className="ml-auto truncate rounded-md bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs md:text-[11px] tracking-tight text-muted">
            {eyebrow}
          </span>
        ) : null}
      </div>

      {/* Preview body */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg">
        {/* Fallback layer — stays mounted under image, fades out smoothly */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${accent} transition-opacity duration-700 ${
            showImage && loaded ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-mono text-[11px] md:text-[10px] uppercase tracking-[0.3em] text-white/70">
              {eyebrow ?? 'Preview'}
            </p>
            <p className="mt-3 font-display text-3xl text-white drop-shadow-md md:text-4xl">
              {title}
            </p>
          </div>
        </div>

        {/* Demo layer: covers the gradient once loaded, for projects without a screenshot */}
        {demo && !showImage ? (
          <Suspense fallback={null}>
            <ProjectDemo kind={demo} active={active} />
          </Suspense>
        ) : null}

        {/* Image layer */}
        {showImage ? (
          <img
            src={resolvedSrc}
            alt={`${title} preview`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            // React 18 only knows the lowercase attribute; camelCase triggers a dev warning.
            {...{ fetchpriority: priority ? 'high' : 'auto' }}
            className={`absolute inset-0 h-full w-full object-contain object-center transition-[opacity,transform] ease-out ${
              loaded ? 'opacity-100' : 'opacity-0'
            } ${active ? 'scale-[1.06] duration-[6000ms]' : 'scale-100 duration-700'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        ) : null}

        {/* Video layer: only mounted while active so it never downloads unless watched */}
        {video && active ? (
          <video
            src={asset(video)}
            poster={resolvedSrc}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            aria-hidden
            onPlaying={() => setVideoReady(true)}
            onEmptied={() => setVideoReady(false)}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
              videoReady ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Subtle hover sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/[0.04] opacity-0 transition-opacity duration-500 group-hover/preview:opacity-100" />
      </div>
    </div>
  );
}
