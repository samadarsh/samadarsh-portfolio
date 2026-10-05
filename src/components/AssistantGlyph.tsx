import { useReducedMotion } from 'framer-motion';

const BUBBLE =
  'M5.5 3.5h13A2.5 2.5 0 0 1 21 6v9a2.5 2.5 0 0 1-2.5 2.5H12.5L8 21v-3.5H5.5A2.5 2.5 0 0 1 3 15V6a2.5 2.5 0 0 1 2.5-2.5z';

/**
 * The mark for Ash, the AI assistant: a speech bubble with a friendly face, so it reads as a personal
 * assistant you can chat with. When animated, the eyes blink every few seconds.
 */
export function AssistantGlyph({
  size = 24,
  animated = false,
  className = '',
  smileColor = 'currentColor',
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  /** Colour of the smile; pick one that contrasts with the background. */
  smileColor?: string;
}) {
  const reduced = useReducedMotion();
  const live = animated && !reduced;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path d={BUBBLE} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      {[9, 15].map((cx) => (
        <ellipse key={cx} cx={cx} cy="9.6" rx="1.25" ry="1.45" fill="currentColor">
          {live ? (
            <animate
              attributeName="ry"
              values="1.45;1.45;0.15;1.45;1.45"
              keyTimes="0;0.88;0.92;0.96;1"
              dur="3.6s"
              repeatCount="indefinite"
            />
          ) : null}
        </ellipse>
      ))}
      <path
        d="M9.2 12.9 Q12 15 14.8 12.9"
        stroke={smileColor}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
