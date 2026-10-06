import { education, experience } from './content';

/**
 * The About page's career story told as a training run: each real milestone is a checkpoint on a
 * loss curve, oldest first. Built from the same data as the rest of the site, so it never drifts.
 */

export type Checkpoint = {
  /** Training step (0–1000) where this checkpoint sits on the curve. */
  step: number;
  label: string;
  title: string;
  role?: string;
  body: string;
  points?: string[];
  final?: boolean;
};

const byDate = [...experience].reverse(); // content.ts lists the newest role first
const degree = education[0];
const job = (company: string) => byDate.find((e) => e.company === company)!;

const fromJob = (company: string, step: number): Checkpoint => {
  const e = job(company);
  return {
    step,
    label: `checkpoint · ${e.period}`,
    title: e.company,
    role: e.role,
    body: e.summary,
    points: e.points,
  };
};

export const checkpoints: Checkpoint[] = [
  {
    step: 0,
    label: `epoch 0 · ${degree.period.split(' ')[0]}`,
    title: 'Initialised',
    body: `${degree.degree} begins at ${degree.school}.`,
  },
  fromJob('Sona Comstar', 300),
  {
    step: 420,
    label: `checkpoint · ${degree.period.split(' ').pop()}`,
    title: 'Graduated',
    body: `${degree.note} Two research papers: food recognition with nutritional insights, and music genre classification with deep learning.`,
  },
  fromJob('Maxitome Management Services', 540),
  fromJob('Angel One', 680),
  fromJob('Bae AI', 820),
  fromJob('Neeroma Technologies', 900),
  {
    step: 1000,
    label: 'converged · now',
    title: 'Ready for deployment',
    body: 'Open to roles, freelance and research collaborations.',
    final: true,
  },
];

/** A believable training loss: fast early drop, small oscillation that settles. */
export const loss = (s: number) =>
  2.4 * Math.exp(-s / 260) + 0.18 + 0.06 * Math.sin(s / 23) * Math.exp(-s / 500);
