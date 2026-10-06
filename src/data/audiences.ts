import type { Audience } from '../lib/audience';

/** Home page sections that "Viewing as" can reorder. */
export type HomeSection = 'facts' | 'matrix' | 'about' | 'works' | 'agent';

type AudienceView = {
  label: string;
  /** Shown under the switch, saying what changed. */
  note: string;
  order: HomeSection[];
  /** Which projects the home page shows, in order. */
  projects: string[];
  worksSubtitle: string;
};

export const audienceViews: Record<Audience, AudienceView> = {
  everyone: {
    label: 'Everyone',
    note: 'Pick who you are and the page reorders for you.',
    order: ['matrix', 'about', 'works', 'agent'],
    projects: ['bite-wise', 'fin-sight', 'voicenote-ai'],
    worksSubtitle:
      "A few of the systems I've shipped recently — each one built for production, not as a demo.",
  },
  recruiter: {
    label: 'Recruiter',
    note: 'Quick facts first, then the short story and the work.',
    order: ['facts', 'about', 'works', 'matrix', 'agent'],
    projects: ['bite-wise', 'fin-sight', 'voicenote-ai'],
    worksSubtitle: 'Three projects that show the range: agents, retrieval and speech AI.',
  },
  engineer: {
    label: 'Engineer',
    note: 'The agent demo and the most technical builds first.',
    order: ['agent', 'works', 'matrix', 'about'],
    projects: ['fin-sight', 'repomind', 'voicenote-ai'],
    worksSubtitle: 'The most technical builds. Each project page shows how it is put together.',
  },
  founder: {
    label: 'Founder',
    note: 'AI products first, then how I build them.',
    order: ['works', 'agent', 'matrix', 'about'],
    projects: ['bite-wise', 'voicenote-ai', 'fin-sight'],
    worksSubtitle: 'AI products I built end to end, from the idea to a working build.',
  },
};
