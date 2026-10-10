// Titles, descriptions and share images for every page. Used by the pages themselves
// (usePageMeta) and by the build, which writes a static HTML file per route so link previews
// on LinkedIn, WhatsApp, X and search engines show the right page (see vite.config.ts).
import { projects, SITE_URL, type Project } from './content';

export { SITE_URL };
export const SITE_NAME = 'Adarsh S';
export const DEFAULT_TITLE = 'Adarsh S — AI Engineer, Agentic Systems';

export type PageMeta = {
  path: string;
  /** Short page name; the full title becomes "<title> — Adarsh S". Null for the home page. */
  title: string | null;
  description: string;
  /** Share image, relative to the site root. */
  image: string;
  imageAlt: string;
};

export const fullTitle = (meta: Pick<PageMeta, 'title'>) =>
  meta.title ? `${meta.title} — ${SITE_NAME}` : DEFAULT_TITLE;

export const pages = {
  home: {
    path: '/',
    title: null,
    description:
      'Adarsh S, AI engineer in Chennai, India. From research to production: AI agents that act in the real world, across multi-agent platforms, cited retrieval and speech AI.',
    image: '/og/home.png',
    imageAlt:
      'Adarsh S — AI Engineer · Agentic Systems. From research to production: AI agents that act in the real world.',
  },
  work: {
    path: '/work',
    title: 'Work',
    description:
      'Selected projects by Adarsh S — AI agents, RAG systems, speech AI and developer tools first, plus product and client websites shipped to production.',
    image: '/og/work.jpg',
    imageAlt: 'Selected work by Adarsh S across AI, product and markets.',
  },
  about: {
    path: '/about',
    title: 'About',
    description:
      'About Adarsh S — AI engineer in Chennai, India, with experience across machine learning engineering and live financial markets.',
    image: '/og/about.jpg',
    imageAlt: 'About Adarsh S, AI engineer in Chennai, India.',
  },
  journal: {
    path: '/journal',
    title: 'Haugtun Research',
    description:
      'Haugtun Research by Adarsh S — notes on Indian markets, investing fundamentals, and how capital moves through cycles.',
    image: '/og/journal.jpg',
    imageAlt: 'Haugtun Research: notes on Indian markets by Adarsh S.',
  },
} satisfies Record<string, PageMeta>;

export const caseStudyMeta = (project: Project): PageMeta => ({
  path: `/work/${project.slug}`,
  title: `${project.title} case study`,
  description: project.summary,
  image: `/og/${project.slug}.jpg`,
  imageAlt: `${project.title}: ${project.eyebrow}`,
});

/** Every route that gets its own prerendered HTML file. */
export const allPages = (): PageMeta[] => [...Object.values(pages), ...projects.map(caseStudyMeta)];
