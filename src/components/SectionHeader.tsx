import { m } from 'framer-motion';

type SectionHeaderProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  italic?: string;
};

export function SectionHeader({
  kicker,
  title,
  subtitle,
  align = 'left',
  italic,
}: SectionHeaderProps) {
  const centered = align === 'center';

  return (
    <m.header
      className={`mb-14 max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {kicker ? (
        <p className="mb-4 font-mono text-xs md:text-[11px] uppercase tracking-[0.25em] text-accent">
          {kicker}
        </p>
      ) : null}
      <h2 className="font-display text-4xl leading-[1.05] tracking-tighter text-text-primary md:text-5xl lg:text-6xl">
        {title}{' '}
        {italic ? (
          <span className="font-display italic text-text-primary/80">{italic}</span>
        ) : null}
      </h2>
      {subtitle ? (
        <p className={`mt-5 text-base leading-relaxed text-muted md:text-lg ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      ) : null}
    </m.header>
  );
}
