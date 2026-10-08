// Builds the plain-text profile Ash, the "Ask Ash" assistant, answers from.
// Imported by api/ask.ts; relative imports carry `.js` so Node's ESM loader resolves them
// after Vercel compiles the function.
import {
  aboutNarrative,
  contact,
  education,
  experience,
  heroContent,
  journalEntries,
  projects,
  publications,
  SITE_URL as SITE,
  skillGroups,
  socialLinks,
  writingMeta,
} from '../data/content.js';
import { sleepsWhenIdle } from './demoHost.js';
import {
  achievements,
  certifications,
  finalYearProject,
  haugtunAbout,
  interests,
  marketsBackground,
  openSource,
  projectDetails,
  proudOf,
  roleDetails,
  schooling,
  skills,
  story,
  strengths,
} from '../data/profile.js';

const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

export function buildKnowledge() {
  return [
    `# Adarsh S`,
    `${heroContent.tagline} Based in ${heroContent.location}.`,
    aboutNarrative.join(' '),
    `His story: ${story}`,
    `Contact: ${contact.email}. ${socialLinks
      .filter((l) => l.label !== 'Email')
      .map((l) => `${l.label}: ${l.href}`)
      .join('. ')}. Resume: ${SITE}/${contact.resumeFile}`,

    `# Experience (most recent first)`,
    ...experience.map((x) =>
      [
        `## ${x.role}, ${x.company} (${x.period}${x.kind ? `, ${x.kind}` : ''})`,
        x.summary,
        list(x.points),
        list(roleDetails[x.company] ?? []),
      ]
        .filter(Boolean)
        .join('\n'),
    ),

    `# Projects (case studies at ${SITE}/work/<slug>)`,
    ...projects.map((p) =>
      [
        `## ${p.title} (${p.eyebrow}, ${p.year}), slug: ${p.slug}`,
        `Role: ${p.role}. ${p.summary}`,
        list(p.highlights),
        p.architecture?.length
          ? `How it works: ${p.architecture.map((s) => (s.detail ? `${s.label} (${s.detail})` : s.label)).join(' → ')}.`
          : '',
        list(projectDetails[p.slug] ?? []),
        `Stack: ${p.stack.join(', ')}.`,
        p.links.live
          ? `Live: ${p.links.live}${sleepsWhenIdle(p.links.live) ? ' (free hosting; the first visit can take about 30 seconds to wake up)' : ''}`
          : '',
        p.links.github ? `GitHub: ${p.links.github}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),

    `# Education`,
    ...education.map((e) => `- ${e.degree}, ${e.school} (${e.period}). ${e.note}`),
    `- ${finalYearProject}`,
    list(schooling),

    `# Publications`,
    list(
      publications.map(
        (p) =>
          `${p.title}. ${p.venues.map((v) => `${v.kind === 'Journal' ? 'Published in' : 'Presented at'} ${v.name}`).join('; ')}.`,
      ),
    ),

    `# Skills`,
    ...skillGroups.map((g) => `- ${g.title}: ${g.items.join(', ')}`),
    ...Object.entries(skills).map(([k, v]) => `- ${k}: ${v.join('; ')}`),

    `# Open-source contributions`,
    list(openSource),

    `# Markets and trading`,
    marketsBackground,

    `# Writing: Haugtun Research (${writingMeta.pageUrl})`,
    haugtunAbout,
    writingMeta.description,
    `Recent posts (2026):`,
    ...journalEntries.map((j) => `- ${j.title} (${j.tag}, ${j.date})`),

    `# Certifications`,
    list(certifications),
    `# Achievements`,
    list(achievements),

    `# What he is most proud of`,
    list(proudOf),
    `# Strengths`,
    list(strengths),
    `# Interests`,
    list(interests),
  ].join('\n\n');
}
