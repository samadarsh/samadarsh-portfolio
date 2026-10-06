// Follow-up questions shown under Ash's latest answer. Picked from a fixed set of questions the
// profile can answer (every project has a stack and "how it works", every role has details), so
// a chip never leads Ash into guessing. Nothing here calls the model.
import { experience, projects } from '../data/content';

const TOPICS: [RegExp, string][] = [
  [/\brag\b|retriev|embedding|vector/i, 'Tell me about FinSight'],
  [/\bagent|\bmcp\b|swiggy/i, 'Tell me about BiteWise'],
  [/speech|whisper|tamil|voice|audio/i, 'Tell me about VoiceNote AI'],
  [/market|trading|nifty|stock|invest|f&o/i, 'What’s his markets background?'],
  [/paper|publication|journal|conference|research/i, 'Any publications?'],
  [/stud|degree|college|university|education/i, 'Where did he study?'],
  [/open.?source|contribut/i, 'What open-source work has he done?'],
];

const DEFAULTS = [
  'What is he working on now?',
  'What are his strongest skills?',
  'Experience with AI agents?',
  'How can I contact him?',
];

const norm = (q: string) =>
  q
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function followUps(answer: string, asked: string[], max = 3): string[] {
  const text = answer.toLowerCase();
  const mentioned = projects.filter((p) => text.includes(p.title.toLowerCase()));
  const company = experience.find((x) => text.includes(x.company.toLowerCase()));

  const candidates = [
    ...mentioned
      .slice(0, 1)
      .flatMap((p) => [`How does ${p.title} work?`, `What stack does ${p.title} use?`]),
    ...(company ? [`What did he do at ${company.company}?`] : []),
    ...TOPICS.filter(([re]) => re.test(answer)).map(([, q]) => q),
    ...DEFAULTS,
  ];

  const seen = new Set(asked.map(norm));
  const out: string[] = [];
  for (const q of candidates) {
    const key = norm(q);
    // Skip what was already asked, and "Tell me about X" when the answer was already about X.
    if (seen.has(key)) continue;
    if (mentioned.some((p) => key === norm(`Tell me about ${p.title}`))) continue;
    seen.add(key);
    out.push(q);
    if (out.length === max) break;
  }
  return out;
}
