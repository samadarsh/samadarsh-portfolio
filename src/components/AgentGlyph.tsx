import { useReducedMotion } from 'framer-motion';

const NODES = [
  [12, 4],
  [20, 18],
  [4, 18],
] as const;
const LOOP = 'M12 4 L20 18 L4 18 Z';

/**
 * The "Ask Adarsh" mark: three linked agents, echoing the hero's network. When animated, a
 * pulse travels around the links and each node lights up as it passes.
 */
export function AgentGlyph({
  size = 24,
  animated = false,
  className = '',
  pulseColor = 'hsl(var(--accent))',
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  /** Colour of the travelling pulse; pick one that contrasts with the background. */
  pulseColor?: string;
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
      <path
        d={LOOP}
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {NODES.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.6" fill="currentColor">
          {live ? (
            <animate
              attributeName="r"
              values="2.6;3.4;2.6"
              dur="2.4s"
              begin={`${(i * 0.8).toFixed(1)}s`}
              repeatCount="indefinite"
              keyTimes="0;0.15;0.3"
              calcMode="spline"
              keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
            />
          ) : null}
        </circle>
      ))}
      {live ? (
        <g>
          <circle r="3.2" fill={pulseColor} opacity="0.3">
            <animateMotion dur="2.4s" repeatCount="indefinite" path={LOOP} />
          </circle>
          <circle r="1.8" fill={pulseColor}>
            <animateMotion dur="2.4s" repeatCount="indefinite" path={LOOP} />
          </circle>
        </g>
      ) : (
        <circle cx="12" cy="13.3" r="1.5" fill={pulseColor} />
      )}
    </svg>
  );
}
