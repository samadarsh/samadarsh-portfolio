// Builds the plain-text profile the "Ask Adarsh" assistant answers from.
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
  skillGroups,
  socialLinks,
  writingMeta,
} from '../data/content.js';
import { resumeOnly } from '../data/profile.js';

const SITE = 'https://samadarsh.vercel.app';
const list = (items: string[]) => items.map((i) => `- ${i}`).join('\n');

export function buildKnowledge() {
  return [
    `# Adarsh S`,
    `${heroContent.tagline} Based in ${heroContent.location}. Open to roles, freelance and research collaborations.`,
    aboutNarrative.join(' '),
    `Contact: ${contact.email}. ${socialLinks
      .filter((l) => l.label !== 'Email')
      .map((l) => `${l.label}: ${l.href}`)
      .join('. ')}. Resume: ${SITE}/${contact.resumeFile}`,

    `# Experience`,
    ...experience.map(
      (x) =>
        `## ${x.role}, ${x.company} (${x.period}${x.kind ? `, ${x.kind}` : ''})\n${x.summary}\n${list(x.points)}`,
    ),
    `Also at Neeroma: ${resumeOnly.neeromaExtra}`,

    `# Projects (case studies at ${SITE}/work/<slug>)`,
    ...projects.map((p) =>
      [
        `## ${p.title} (${p.eyebrow}, ${p.year}) — slug: ${p.slug}`,
        `Role: ${p.role}. ${p.summary}`,
        p.architecture?.length
          ? `How it works: ${p.architecture.map((s) => (s.detail ? `${s.label} (${s.detail})` : s.label)).join(' → ')}.`
          : list(p.highlights),
        `Stack: ${p.stack.join(', ')}.`,
        p.links.live ? `Live: ${p.links.live}` : '',
        p.links.github ? `GitHub: ${p.links.github}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    ),

    `# Education`,
    ...education.map((e) => `- ${e.degree}, ${e.school} (${e.period}). ${e.note}`),
    list(resumeOnly.schooling),

    `# Skills`,
    ...skillGroups.map((g) => `- ${g.title}: ${g.items.join(', ')}`),
    ...Object.entries(resumeOnly.skills).map(([k, v]) => `- ${k}: ${v.join(', ')}`),

    `# Open source contributions`,
    list(resumeOnly.openSource),
    `# Publications`,
    list(resumeOnly.publications),
    `# Certifications`,
    list(resumeOnly.certifications),
    `# Achievements`,
    list(resumeOnly.achievements),

    `# Writing: Haugtun Research (${writingMeta.pageUrl})`,
    writingMeta.description,
    ...journalEntries.map((j) => `- ${j.title} (${j.tag}, ${j.date})`),
  ].join('\n\n');
}
