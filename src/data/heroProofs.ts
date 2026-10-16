import { projects } from './content';
import { walkthroughs, type Walkthrough } from './walkthrough';

/**
 * The four results the home hero reveals, each paired with the research question it answers.
 * The numbers are read from the case-study data, so the hero can't drift from the case studies.
 */

export type HeroProof = {
  project: string;
  /** The question the project set out to answer, shown on the hero's research layer. */
  question: string;
  /** The measured answer, shown when the visitor reveals the production layer. */
  value: string;
  label: string;
};

function walkthrough<K extends Walkthrough['kind']>(slug: string, kind: K) {
  const w = walkthroughs[slug];
  if (w?.kind !== kind) throw new Error(`heroProofs: ${slug} has no ${kind} walkthrough`);
  return w as Extract<Walkthrough, { kind: K }>;
}

const finsight = projects.find((p) => p.slug === 'fin-sight')?.results?.metrics[0];
if (!finsight) throw new Error('heroProofs: fin-sight has no results');
const speech = walkthrough('voicenote-ai', 'speech');
const agent = walkthrough('bite-wise', 'agent');
const repo = walkthrough('repomind', 'repo');

export const heroProofs: HeroProof[] = [
  {
    project: 'FinSight',
    question: 'Can a small local model read a 360-page report?',
    value: finsight.value,
    label: 'answer page in the top 5',
  },
  {
    project: 'VoiceNote AI',
    question: 'Does Whisper hear Tamil voice notes?',
    value: `${speech.errors.charTotal - speech.errors.chars}/${speech.errors.charTotal}`,
    label: 'Tamil characters exact',
  },
  {
    project: 'BiteWise',
    question: 'Can an agent order lunch, safely?',
    value: `${agent.guardrails.length}/${agent.guardrails.length}`,
    label: 'guardrails held',
  },
  {
    project: 'RepoMind',
    question: 'Explain a whole repo on a free tier?',
    value: `${repo.seconds} s`,
    label: 'whole repo explained',
  },
];

/** The same results as one sentence, for screen readers and the reduced-motion hero. */
export const heroProofSentence = heroProofs.map((p) => `${p.project}: ${p.value} ${p.label}`).join('. ') + '.';
