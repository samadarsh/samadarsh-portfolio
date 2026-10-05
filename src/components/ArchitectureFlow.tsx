import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

type Step = { label: string; detail?: string };

/** Seconds for the pulse to travel the whole pipeline, then a short rest before it repeats. */
const TRAVEL = 3.6;
const CYCLE = TRAVEL / 0.8;

type Geometry = {
  rail: CSSProperties;
  dx: number;
  dy: number;
  /** Fraction of the rail at which the pulse reaches each step. */
  at: number[];
};

/**
 * The case-study pipeline as a diagram: a pulse runs along the rail from the first step to the
 * last, and each step lights up as it passes. Horizontal on wide screens, vertical on phones.
 * The pulse runs only while the diagram is on screen; reduced motion shows it static.
 */
export function ArchitectureFlow({ steps }: { steps: Step[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const [seen, setSeen] = useState(false);
  const [live, setLive] = useState(false);

  // Measure where the step markers really are, so timing matches any card height.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const box = list.getBoundingClientRect();
      const centers = [...list.querySelectorAll<HTMLElement>('[data-node]')].map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      if (centers.length < 2) return;
      const first = centers[0];
      const last = centers[centers.length - 1];
      const horizontal = Math.abs(last.x - first.x) > Math.abs(last.y - first.y);
      const length = horizontal ? last.x - first.x : last.y - first.y;
      setGeo({
        rail: horizontal
          ? { left: first.x, top: first.y - 1, width: length, height: 2 }
          : { left: first.x - 1, top: first.y, width: 2, height: length },
        dx: horizontal ? length : 0,
        dy: horizontal ? 0 : length,
        at: centers.map((c) => (horizontal ? c.x - first.x : c.y - first.y) / length),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [steps]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setLive(entry.isIntersecting);
        if (entry.isIntersecting) setSeen(true);
      },
      { threshold: 0.35 },
    );
    io.observe(list);
    return () => io.disconnect();
  }, []);

  return (
    <ol
      ref={listRef}
      id="how-it-works"
      className={`arch relative mt-6 grid gap-3 md:gap-4 ${seen ? 'arch-seen' : ''} ${live ? 'arch-live' : ''}`}
      style={{ '--arch-cols': steps.length, '--arch-cycle': `${CYCLE}s` } as CSSProperties}
    >
      {geo ? (
        <div className="arch-rail" style={geo.rail} aria-hidden>
          <i
            className="arch-pulse"
            style={{ '--arch-dx': `${geo.dx}px`, '--arch-dy': `${geo.dy}px` } as CSSProperties}
          />
        </div>
      ) : null}
      {steps.map((step, i) => {
        const delay = `${(geo?.at[i] ?? i / (steps.length - 1)) * TRAVEL}s`;
        return (
          <li
            key={step.label}
            className="arch-step"
            style={{ '--arch-i': i, '--arch-delay': delay } as CSSProperties}
          >
            <span data-node className="arch-node" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="arch-card">
              <p className="text-[15px] font-medium text-text-primary">{step.label}</p>
              {step.detail ? <p className="mt-1 text-sm text-muted">{step.detail}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
