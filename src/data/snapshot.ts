// A plain-HTML version of each page, written into the prerendered files at build time (see
// vite.config.ts). AI crawlers (ChatGPT, Claude, Perplexity) and other bots that don't run
// JavaScript would otherwise see an empty page. React replaces it when the app mounts, so people
// never see it. Built from the same data the pages render, so it can't drift. Also builds llms.txt.
import {
  aboutNarrative,
  contact,
  education,
  experience,
  heroContent,
  journalEntries,
  projects,
  publications,
  skillGroups,
  SITE_URL,
  socialLinks,
  writingMeta,
  type Project,
} from './content';
import { caseStudyMeta, pages, type PageMeta } from './seo';

const esc = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;
const list = (items: string[]) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const para = (text: string) => `<p>${esc(text)}</p>`;

const ROLE = `${experience[0].role} at ${experience[0].company}`;
const resumeUrl = `/${contact.resumeFile}`;

const header = () =>
  `<header><p>${link('/', 'Adarsh S')} · ${esc(ROLE)} · ${esc(heroContent.location)}</p>` +
  `<nav aria-label="Site">${list([
    link('/work', 'Work'),
    link('/about', 'About'),
    link('/journal', 'Haugtun Research'),
    link(resumeUrl, 'Resume (PDF)'),
  ])}</nav></header>`;

const footer = () =>
  `<footer><h2>Contact</h2>${list([
    link(`mailto:${contact.email}`, contact.email),
    ...socialLinks.filter((s) => s.label !== 'Email').map((s) => link(s.href, s.label)),
  ])}</footer>`;

const projectLinks = (p: Project) =>
  [
    p.links.live ? link(p.links.live, 'Live demo') : null,
    p.links.github ? link(p.links.github, 'Source on GitHub') : null,
  ].filter((x): x is string => x !== null);

const projectCard = (p: Project) =>
  `<article><h3>${link(`/work/${p.slug}`, p.title)}</h3>` +
  `<p>${esc(p.eyebrow)} · ${esc(p.year)} · ${esc(p.role)}</p>${para(p.summary)}` +
  `<p>Stack: ${esc(p.stack.join(', '))}</p></article>`;

const results = (p: Project) => {
  const r = p.results;
  if (!r) return '';
  return (
    `<section><h2>Results</h2>${para(r.setup)}` +
    list(
      r.metrics.map(
        (m) => `${esc(m.label)}: <strong>${esc(m.value)}</strong>${m.detail ? ` (${esc(m.detail)})` : ''}`,
      ),
    ) +
    (r.note ? para(r.note) : '') +
    (r.source ? `<p>${link(r.source.href, r.source.label)}</p>` : '') +
    `</section>`
  );
};

const home = () =>
  `<h1>Adarsh S</h1>${para(heroContent.tagline)}<p>${esc(ROLE)}, ${esc(heroContent.location)}.</p>` +
  `<section><h2>About</h2>${aboutNarrative.map(para).join('')}</section>` +
  `<section><h2>Selected work</h2>${projects.map(projectCard).join('')}</section>` +
  `<section><h2>Experience</h2>${list(
    experience.map((e) => `${esc(e.role)}, ${esc(e.company)} (${esc(e.period)}): ${esc(e.summary)}`),
  )}</section>`;

const work = () =>
  `<h1>Work</h1>${para(pages.work.description)}${projects.map(projectCard).join('')}`;

const caseStudy = (p: Project) =>
  `<article><h1>${esc(p.title)}</h1><p>${esc(p.eyebrow)} · ${esc(p.year)} · ${esc(p.role)}</p>` +
  para(p.summary) +
  (projectLinks(p).length ? list(projectLinks(p)) : '') +
  (p.architecture
    ? `<section><h2>How it works</h2><ol>${p.architecture
        .map((s) => `<li>${esc(s.label)}${s.detail ? `: ${esc(s.detail)}` : ''}</li>`)
        .join('')}</ol></section>`
    : '') +
  results(p) +
  `<section><h2>Highlights</h2>${list(p.highlights.map(esc))}</section>` +
  `<section><h2>Stack</h2>${para(p.stack.join(', '))}</section>` +
  `<p>${link('/work', 'All projects')}</p></article>`;

const about = () =>
  `<h1>About Adarsh S</h1>${aboutNarrative.map(para).join('')}` +
  `<section><h2>Experience</h2>${experience
    .map(
      (e) =>
        `<article><h3>${esc(e.role)}, ${esc(e.company)}</h3><p>${esc(e.period)}</p>${para(e.summary)}${list(
          e.points.map(esc),
        )}</article>`,
    )
    .join('')}</section>` +
  `<section><h2>Education</h2>${list(
    education.map((e) => `${esc(e.degree)}, ${esc(e.school)} (${esc(e.period)}). ${esc(e.note)}`),
  )}</section>` +
  `<section><h2>Publications</h2>${list(
    publications.map(
      (p) => `${esc(p.title)}. ${esc(p.venues.map((v) => `${v.kind}: ${v.name}`).join('; '))}`,
    ),
  )}</section>` +
  `<section><h2>Skills</h2>${list(
    skillGroups.map((g) => `${esc(g.title)}: ${esc(g.items.join(', '))}`),
  )}</section>`;

const journal = () =>
  `<h1>Haugtun Research</h1>${para(writingMeta.description)}` +
  `<p>${link(writingMeta.pageUrl, 'Haugtun on LinkedIn')}</p>` +
  journalEntries
    .map(
      (j) =>
        `<article><h2>${link(j.href, j.title)}</h2><p>${esc(j.tag)} · ${esc(j.date)}</p>${para(j.summary)}</article>`,
    )
    .join('');

const BODIES: Record<string, () => string> = {
  '/': home,
  '/work': work,
  '/about': about,
  '/journal': journal,
  ...Object.fromEntries(projects.map((p) => [caseStudyMeta(p).path, () => caseStudy(p)])),
};

/**
 * The page as plain HTML, wrapped so it takes no space on screen until React replaces it.
 * Without JavaScript, the <noscript> rule in index.html shows it instead.
 */
export function snapshotHtml(page: PageMeta) {
  const body = BODIES[page.path];
  if (!body) throw new Error(`snapshot: no content for ${page.path}`);
  return `<div class="prerender">${header()}<main>${body()}</main>${footer()}</div>`;
}

/** llms.txt (llmstxt.org): a short Markdown guide to the site for AI tools. */
export function llmsTxt() {
  const projectLine = (p: Project) => {
    const metric = p.results?.metrics[0];
    const measured = metric ? ` Measured: ${metric.label.toLowerCase()} ${metric.value}.` : '';
    return `- [${p.title}](${SITE_URL}/work/${p.slug}): ${p.eyebrow}. ${p.summary}${measured}`;
  };
  return [
    '# Adarsh S',
    '',
    `> ${ROLE}, based in ${heroContent.location}. Builds agentic systems, retrieval with citations and speech AI, and takes them from demo to production with measured results.`,
    '',
    aboutNarrative.slice(0, 2).join(' '),
    '',
    '## Projects',
    '',
    ...projects.map(projectLine),
    '',
    '## Pages',
    '',
    `- [About](${SITE_URL}/about): experience, education, publications and skills.`,
    `- [${pages.journal.title}](${SITE_URL}/journal): ${writingMeta.description}`,
    `- [Resume (PDF)](${SITE_URL}${resumeUrl})`,
    '',
    '## Experience',
    '',
    ...experience.map((e) => `- ${e.role}, ${e.company} (${e.period}): ${e.summary}`),
    '',
    '## Contact',
    '',
    `- Email: ${contact.email}`,
    ...socialLinks.filter((s) => s.label !== 'Email').map((s) => `- ${s.label}: ${s.href}`),
    '',
  ].join('\n');
}
