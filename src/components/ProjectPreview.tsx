import { useState } from 'react';

type ProjectPreviewProps = {
  src?: string;
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

export function ProjectPreview({
  src,
  title,
  url,
  accent,
  eyebrow,
  className = '',
  priority = false,
}: ProjectPreviewProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const hostname = safeHostname(url);
  const resolvedSrc = src ? `${import.meta.env.BASE_URL}${src.replace(/^\//, '')}` : undefined;
  const showImage = resolvedSrc && !errored;

  return (
    <div
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

        {/* Image layer */}
        {showImage ? (
          <img
            src={resolvedSrc}
            alt={`${title} preview`}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            // React 18 only knows the lowercase attribute; camelCase triggers a dev warning.
            {...{ fetchpriority: priority ? 'high' : 'auto' }}
            className={`absolute inset-0 h-full w-full object-contain object-center transition-opacity duration-700 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        ) : null}

        {/* Subtle hover sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/[0.04] opacity-0 transition-opacity duration-500 group-hover/preview:opacity-100" />
      </div>
    </div>
  );
}
