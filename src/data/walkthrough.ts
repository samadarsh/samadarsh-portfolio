// A real question traced through a project, shown on its case study as a pinned, scroll-driven
// walkthrough (components/Walkthrough.tsx). Everything here comes from an actual run: the chunks
// and similarity scores are FinSight's retrieval output (local BGE embeddings, ChromaDB, k = 5,
// company = TCS) and the answer is Llama 3's, word for word, from the evaluation saved on
// 10 Oct 2026. Citations in the answer are written [[p.N]] and drawn as chips.

export type WalkthroughHit = { page: number; score: number; text: string };

export type Walkthrough = {
  question: string;
  company: string;
  document: { file: string; pages: number; page: number; section: string; highlight: string };
  chunking: { size: number; overlap: number; model: string; dims: number; companyChunks: number; totalChunks: number };
  /** The chunk that holds the answer, split around the sentence that answers it. */
  chunk: { before: string; answer: string; after: string };
  /** A neighbouring chunk from the same page, for contrast. */
  neighbour: string;
  /** What text extraction did to this page, shown as a note. */
  extractionNote: { found: string; text: string };
  hits: WalkthroughHit[];
  model: string;
  answer: string;
  latencySeconds: number;
  /** The source passage shown under the answer; `mark` is the sentence the answer relies on. */
  source: { mark: string; rest: string };
};

export const walkthroughs: Record<string, Walkthrough> = {
  'fin-sight': {
    question: 'What helped TCS expand its operating margin in FY 2026, and what offset it?',
    company: 'TCS',
    document: {
      file: 'annual-report-2025-2026.pdf',
      pages: 360,
      page: 24,
      section: 'Financial capital',
      highlight:
        'In FY 2026, TCS reported an operating margin of 25.0%, an improvement of 70 basis points compared to FY 2025, and was at a 4-year high.',
    },
    chunking: {
      size: 1000,
      overlap: 150,
      model: 'BAAI/bge-small-en-v1.5',
      dims: 384,
      companyChunks: 1315,
      totalChunks: 3044,
    },
    chunk: {
      before: '… compared to FY 2025, and was at a 4-year high. ',
      answer:
        'Improvement of business mix, productivity and realisation, rebalancing of pyramid along with favourable currency movements helped the expansion of margins.',
      after:
        ' These were offset by investments in talent and capability building … Operating Profit Trend (H crore)',
    },
    neighbour:
      '… In FY 2026, TCS achieved a year-over year revenue growth of 4.6%, led by focused and effective execution. On a constant currency basis, revenue declined by 2.4% …',
    extractionNote: {
      found: '(H crore)',
      text: "is how this PDF's ₹ sign comes out of text extraction. The evaluation had to account for it.",
    },
    hits: [
      {
        page: 24,
        score: 0.786,
        text: 'Improvement of business mix, productivity and realisation, rebalancing of pyramid along with favourable currency movements helped the expansion of margins.',
      },
      {
        page: 58,
        score: 0.78,
        text: 'On a reported basis, TCS’ revenue grew 4.6% in FY 2026, compared to 6.0% in the prior year.',
      },
      {
        page: 24,
        score: 0.762,
        text: 'In FY 2026, TCS achieved a year-over year revenue growth of 4.6%, led by focused and effective execution.',
      },
      {
        page: 24,
        score: 0.72,
        text: 'Return on Equity (%) … FY 2025 52.2% FY 2026 51.4% Best in class RoE',
      },
      {
        page: 58,
        score: 0.719,
        text: 'EBIT margins reached 25.0% in FY 2026, up from 24.3% the previous year, marking the highest operating margin in four years.',
      },
    ],
    model: 'Llama 3 8B · Ollama',
    answer:
      'According to [[p.24]], improvement of business mix, productivity, and realisation, rebalancing of pyramid along with favourable currency movements helped the expansion of margins. The investments in talent and capability building, and other investments for strengthening ecosystem partnerships and increasing Go-to-Market pipeline offset the expansion of margins [[p.24]].',
    latencySeconds: 7.2,
    source: {
      mark: 'Improvement of business mix, productivity and realisation, rebalancing of pyramid along with favourable currency movements helped the expansion of margins.',
      rest: ' These were offset by investments in talent and capability building, and other investments for strengthening ecosystem partnerships and increasing Go-to-Market pipeline.',
    },
  },
};
