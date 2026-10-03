import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a, button, [data-cursor]';
const MAGNET_STRENGTH = { x: 0.2, y: 0.3 };

/**
 * A soft ring that trails the pointer and grows over links and buttons (with an optional
 * `data-cursor` label), plus a magnetic pull on `[data-magnetic]` elements.
 * Only on precise pointers and when motion is allowed; the native cursor stays visible.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    const label = labelRef.current;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!ring || !label || !canHover || reduced) return;

    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;
    let frame = 0;
    let magnet: HTMLElement | null = null;

    const releaseMagnet = () => {
      if (magnet) magnet.style.transform = '';
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      ring.style.opacity = '1';

      const target = (e.target as Element | null)?.closest<HTMLElement>('[data-magnetic]') ?? null;
      if (target !== magnet) releaseMagnet();
      if (target) {
        magnet = target;
        const r = target.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        target.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
        target.style.transform = `translate(${dx * MAGNET_STRENGTH.x}px, ${dy * MAGNET_STRENGTH.y}px)`;
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(INTERACTIVE);
      ring.dataset.active = el ? 'true' : 'false';
      label.textContent = el?.dataset.cursor ?? '';
      ring.dataset.labelled = el?.dataset.cursor ? 'true' : 'false';
    };

    const onLeave = () => {
      ring.style.opacity = '0';
      releaseMagnet();
    };

    const loop = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.documentElement.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      releaseMagnet();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      className="custom-cursor"
      aria-hidden
      data-active="false"
      data-labelled="false"
    >
      <span ref={labelRef} className="custom-cursor-label" />
    </div>
  );
}
