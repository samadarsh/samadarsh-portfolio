import type { Token } from './tokens';

/** The tokens drawn as spans; the scroll engine reveals them by toggling `on`. */
export function TypedTokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} className={t.kind === 'cite' ? 'wt-tok wt-cite' : 'wt-tok'}>
          {t.text}
        </span>
      ))}
    </>
  );
}
