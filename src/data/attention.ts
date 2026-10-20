// "What I build" on the home page: an attention matrix between four focus areas and the work
// they show up in, styled after how transformers weigh one token against another. Weights are a
// judgement of how central the area is to that work (1 = the core of it); every note states only
// what the rest of the site says. Unlisted pairs have no link.

export type FocusId = 'rag' | 'agents' | 'speech' | 'markets';
export type WorkId = 'fin' | 'bite' | 'voice' | 'repo' | 'neeroma' | 'evals' | 'papers' | 'haugtun';

export const focusAreas: { id: FocusId; label: string }[] = [
  { id: 'rag', label: 'Retrieval systems' },
  { id: 'agents', label: 'AI agents' },
  { id: 'speech', label: 'Speech AI' },
  { id: 'markets', label: 'Financial markets' },
];

export const workItems: { id: WorkId; label: string; href: string }[] = [
  { id: 'fin', label: 'FinSight', href: '/work/fin-sight' },
  { id: 'bite', label: 'BiteWise', href: '/work/bite-wise' },
  { id: 'voice', label: 'VoiceNote AI', href: '/work/voicenote-ai' },
  { id: 'repo', label: 'RepoMind', href: '/work/repomind' },
  { id: 'neeroma', label: 'Neeroma · Yantra', href: '/about#experience' },
  { id: 'evals', label: 'Outlier · Mercor', href: '/about#experience' },
  { id: 'papers', label: 'Research papers', href: '/about#publications' },
  { id: 'haugtun', label: 'Haugtun Research', href: '/journal' },
];

export const attention: Partial<
  Record<FocusId, Partial<Record<WorkId, { w: number; note: string }>>>
> = {
  rag: {
    fin: {
      w: 0.92,
      note: 'FinSight is a retrieval (RAG) system over financial PDFs, with page-level citations.',
    },
    repo: { w: 0.41, note: 'RepoMind analyses repository files with a multi-stage LLM pipeline.' },
    evals: {
      w: 0.47,
      note: 'At Outlier: BrowseComp and GAIA web-research tasks, with answer keys verified against primary sources.',
    },
    papers: {
      w: 0.33,
      note: 'The food recognition paper pairs recognition with nutritional insights and meal recording.',
    },
  },
  agents: {
    bite: {
      w: 0.9,
      note: 'BiteWise runs agents over Swiggy MCP for ordering and pantry planning.',
    },
    neeroma: {
      w: 0.86,
      note: 'At Neeroma: Yantra, a multi-agent platform, debugging L5 Deploy Agent trajectories and building L6 Tickets Agent triage logic.',
    },
    evals: {
      w: 0.58,
      note: 'At Outlier and Mercor: model-breaking tasks for frontier LLMs, tracing their search trajectories and reasoning chains.',
    },
    repo: {
      w: 0.44,
      note: 'RepoMind chains several LLM stages to classify and explain repositories.',
    },
  },
  speech: {
    voice: {
      w: 0.94,
      note: 'VoiceNote AI transcribes Tamil speech with Whisper and romanizes it into Latin script.',
    },
    papers: { w: 0.38, note: 'The music genre paper classifies audio with deep learning.' },
  },
  markets: {
    haugtun: { w: 0.84, note: 'Haugtun Research publishes structured notes on Indian markets.' },
    fin: {
      w: 0.52,
      note: 'FinSight answers questions over annual reports, earnings transcripts and SEBI filings.',
    },
  },
};
