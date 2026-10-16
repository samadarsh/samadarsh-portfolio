import { CopyEmailButton } from './ContactActions';
import { useAskAdarsh } from './AskAdarsh';
import { AssistantGlyph } from './AssistantGlyph';
import { HeroTerminal } from './HeroTerminal';
import { SectionHeader } from './SectionHeader';
import { ViewingAs } from './ViewingAs';

/**
 * Straight after the full-screen hero: the ways to talk to me (contact, Ask Ash, the terminal) and
 * the "Viewing as" switch that reorders the rest of the home page.
 */
export function HeroExtras() {
  const askAdarsh = useAskAdarsh();

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <SectionHeader kicker="Say hello" title="Ask me anything," italic="or ask Ash." />
            <div className="-mt-6 flex flex-wrap gap-3">
              <a
                href="#contact"
                data-magnetic
                className="inline-flex grow items-center justify-center gap-2 whitespace-nowrap rounded-full bg-text-primary px-5 py-3 text-sm font-medium text-bg transition hover:bg-text-primary/90 sm:grow-0 sm:py-2.5"
              >
                Get in touch
              </a>
              <button
                type="button"
                onClick={() => askAdarsh.open()}
                data-magnetic
                className="inline-flex grow items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/[0.06] px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-accent sm:grow-0 sm:py-2.5"
              >
                <AssistantGlyph size={16} className="text-accent" />
                Ask Ash
              </button>
              <CopyEmailButton />
            </div>
            <ViewingAs />
          </div>
          <div className="min-w-0">
            <HeroTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
