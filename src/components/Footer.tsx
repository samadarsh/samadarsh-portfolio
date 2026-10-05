import { contact, socialLinks } from '../data/content';
import { CopyEmailButton, ResumeButton } from './ContactActions';

const MARQUEE_TEXT = 'Built with intent · Engineered with discipline · Shipped to production';

const elsewhereSocials = socialLinks.filter((s) => s.label !== 'Email');

const MailIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </svg>
);

export function Footer() {

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-white/[0.06]">
      <div className="overflow-hidden border-b border-white/[0.06] py-8">
        <div className="marquee-track flex w-max whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-6 px-6 font-display text-4xl text-text-primary/60 md:text-5xl"
            >
              <span>{MARQUEE_TEXT}</span>
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div id="contact" className="container mx-auto max-w-6xl px-6 py-20 md:py-24 scroll-mt-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <p className="font-mono text-xs md:text-[11px] uppercase tracking-[0.25em] text-accent">
              Let's build
            </p>
            <h2 className="mt-5 font-display text-4xl leading-[1.08] tracking-tight text-text-primary md:text-5xl lg:text-6xl">
              Have a system <span className="italic">worth shipping?</span>
            </h2>
            <p className="mt-5 max-w-md text-base text-muted">
              The fastest way to reach me — drop a note and I'll get back within a day.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${contact.email}`}
                data-achievement="contact"
                data-magnetic
                className="inline-flex items-center gap-3 rounded-full bg-text-primary px-6 py-3 text-sm font-medium text-bg transition hover:bg-text-primary/90"
              >
                <MailIcon />
                <span>Email me</span>
              </a>
              <ResumeButton />
            </div>
            <CopyEmailButton className="mt-3" />
          </div>

          <div className="md:col-span-5 md:border-l md:border-white/[0.06] md:pl-12">
            <p className="font-mono text-xs md:text-[11px] uppercase tracking-[0.25em] text-muted">
              Find me elsewhere
            </p>
            <ul className="mt-5 space-y-3">
              {elsewhereSocials.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-white/[0.06] py-3 transition first:border-t"
                  >
                    <span className="font-display text-xl tracking-tight text-text-primary transition group-hover:text-accent md:text-2xl">
                      {link.label}
                    </span>
                    <span className="text-muted transition group-hover:translate-x-0.5 group-hover:text-accent">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} Adarsh S — All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.2em]">Chennai · India</p>
        </div>
      </div>
    </footer>
  );
}
