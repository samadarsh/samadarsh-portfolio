import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attention, focusAreas, workItems, type FocusId, type WorkId } from '../data/attention';
import { SectionHeader } from './SectionHeader';

/**
 * "What I build": an attention matrix between four focus areas and the work they show up in.
 * Brighter cells are stronger links; picking a cell explains it and links to the work, picking a
 * row or column name highlights its line. Wide screens put the focus areas down the side; phones
 * turn the grid so the four areas are columns and nothing scrolls sideways.
 */

type Pick =
  | { kind: 'cell'; focus: FocusId; work: WorkId }
  | { kind: 'focus'; id: FocusId }
  | { kind: 'work'; id: WorkId };

const weight = (focus: FocusId, work: WorkId) => attention[focus]?.[work]?.w ?? 0;
const focusLabel = (id: FocusId) => focusAreas.find((f) => f.id === id)!.label;
const workItem = (id: WorkId) => workItems.find((w) => w.id === id)!;

function useWide() {
  const query = '(min-width: 768px)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

export function AttentionMatrix() {
  const wide = useWide();
  const [pick, setPick] = useState<Pick>({ kind: 'cell', focus: 'agents', work: 'bite' });

  // Rows and columns swap on phones; a cell is always (focus, work) underneath.
  const rows = wide ? focusAreas.map((f) => f.id) : workItems.map((w) => w.id);
  const cols = wide ? workItems.map((w) => w.id) : focusAreas.map((f) => f.id);
  const cellAt = (row: string, col: string) =>
    (wide ? { focus: row, work: col } : { focus: col, work: row }) as {
      focus: FocusId;
      work: WorkId;
    };
  const label = (id: string, isRow: boolean) =>
    wide === isRow ? focusLabel(id as FocusId) : workItem(id as WorkId).label;
  const lineOf = (id: string, isRow: boolean): Pick =>
    wide === isRow ? { kind: 'focus', id: id as FocusId } : { kind: 'work', id: id as WorkId };

  const inLine = (focus: FocusId, work: WorkId) =>
    pick.kind === 'cell' || (pick.kind === 'focus' ? pick.id === focus : pick.id === work);
  const isPicked = (focus: FocusId, work: WorkId) =>
    pick.kind === 'cell' && pick.focus === focus && pick.work === work;
  const lineActive = (id: string, isRow: boolean) => {
    const line = lineOf(id, isRow);
    return pick.kind === line.kind && 'id' in pick && 'id' in line && pick.id === line.id;
  };

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <SectionHeader
          kicker="What I build"
          title="Where my focus"
          italic="meets my work."
          subtitle="Brighter means more connected, the way attention links one word to another inside a transformer. Tap a cell."
        />

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <table className="w-full border-separate [border-spacing:5px] md:w-auto">
              <thead>
                <tr>
                  <th aria-hidden />
                  {cols.map((col) => (
                    <th key={col} scope="col" className="p-0 align-bottom font-normal">
                      <button
                        type="button"
                        onClick={() => setPick(lineOf(col, false))}
                        className={`flex min-h-[40px] w-full items-end justify-center pb-1.5 font-mono text-[10.5px] leading-tight transition-colors md:h-32 md:min-h-0 ${
                          lineActive(col, false)
                            ? 'text-text-primary'
                            : 'text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className="md:[writing-mode:vertical-rl] md:rotate-180">
                          {label(col, false)}
                        </span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    <th scope="row" className="p-0 text-left font-normal">
                      <button
                        type="button"
                        onClick={() => setPick(lineOf(row, true))}
                        className={`min-h-[40px] w-full max-w-[8.5rem] pr-2 text-left font-mono text-[11px] leading-tight transition-colors md:max-w-none md:whitespace-nowrap ${
                          lineActive(row, true)
                            ? 'text-text-primary'
                            : 'text-muted hover:text-text-primary'
                        }`}
                      >
                        {label(row, true)}
                      </button>
                    </th>
                    {cols.map((col) => {
                      const { focus, work } = cellAt(row, col);
                      const w = weight(focus, work);
                      const picked = isPicked(focus, work);
                      return (
                        <td key={col} className="p-0">
                          <button
                            type="button"
                            onClick={() => setPick({ kind: 'cell', focus, work })}
                            aria-label={`${focusLabel(focus)} and ${workItem(work).label}: ${w ? `attention ${w.toFixed(2)}` : 'no strong link'}`}
                            aria-pressed={picked}
                            className={`block h-10 w-full min-w-[40px] rounded-lg font-mono text-[11px] transition-[transform,box-shadow,opacity] duration-200 hover:scale-105 md:h-[42px] md:w-[52px] ${
                              picked
                                ? 'text-bg shadow-[0_0_0_2px_hsl(var(--text))]'
                                : 'text-transparent'
                            } ${inLine(focus, work) ? '' : 'opacity-30'}`}
                            style={{
                              background: `hsl(var(--accent) / ${Math.max(0.06, w).toFixed(2)})`,
                            }}
                          >
                            {w ? w.toFixed(2) : ''}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="mt-3 flex items-center gap-2 font-mono text-[11px] text-muted"
              aria-hidden
            >
              weak
              <span className="inline-block h-1.5 w-20 rounded-full bg-gradient-to-r from-accent/5 to-accent" />
              strong
            </div>
          </div>

          <Explain pick={pick} />
        </div>
      </div>
    </section>
  );
}

function Explain({ pick }: { pick: Pick }) {
  let kicker: string;
  let title: string;
  let body: string;
  let w = 0;
  let link: { href: string; label: string } | null = null;

  if (pick.kind === 'cell') {
    const item = workItem(pick.work);
    const entry = attention[pick.focus]?.[pick.work];
    w = entry?.w ?? 0;
    kicker = `${focusLabel(pick.focus)} ↔ ${item.label}`;
    title = entry ? `Attention ${entry.w.toFixed(2)}` : 'No strong link';
    body = entry?.note ?? 'These two aren’t directly connected in my work.';
    link = { href: item.href, label: `Open ${item.label}` };
  } else {
    const links =
      pick.kind === 'focus'
        ? workItems.map((x) => ({ name: x.label, w: weight(pick.id, x.id) }))
        : focusAreas.map((f) => ({ name: f.label, w: weight(f.id, pick.id) }));
    const strong = links.filter((x) => x.w).sort((a, b) => b.w - a.w);
    kicker = pick.kind === 'focus' ? focusLabel(pick.id) : workItem(pick.id).label;
    title = `${strong.length} strong link${strong.length === 1 ? '' : 's'}`;
    body = strong.map((x) => `${x.name} ${x.w.toFixed(2)}`).join(' · ');
    if (pick.kind === 'work')
      link = { href: workItem(pick.id).href, label: `Open ${workItem(pick.id).label}` };
  }

  return (
    <div
      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 md:p-6"
      aria-live="polite"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">{kicker}</p>
      <p className="mt-2 font-display text-2xl tracking-tight text-text-primary md:text-3xl">
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">{body}</p>
      {pick.kind === 'cell' ? (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500"
            style={{ width: `${Math.round(w * 100)}%` }}
          />
        </div>
      ) : null}
      {link ? (
        <Link
          to={link.href}
          className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-sm text-text-primary"
        >
          <span className="border-b border-accent/40 pb-0.5">{link.label}</span>
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
