// The hero tagline, word by word, with the alternatives shown when a visitor taps a word, in the
// style of a language model's next-token candidates. The first candidate of each word is the
// word itself, and the words join to exactly heroContent.tagline. Probabilities are for show.
// To change what a word offers, edit its list here.

export type TaglineToken = { word: string; candidates: [string, number][] };

export const taglineTokens: TaglineToken[] = [
  {
    word: 'Building',
    candidates: [
      ['Building', 0.58],
      ['Shipping', 0.24],
      ['Designing', 0.11],
      ['Training', 0.07],
    ],
  },
  {
    word: 'AI',
    candidates: [
      ['AI', 0.74],
      ['ML', 0.12],
      ['agentic', 0.09],
      ['LLM', 0.05],
    ],
  },
  {
    word: 'and',
    candidates: [
      ['and', 0.93],
      ['plus', 0.07],
    ],
  },
  {
    word: 'data',
    candidates: [
      ['data', 0.61],
      ['retrieval', 0.2],
      ['speech', 0.1],
      ['agent', 0.09],
    ],
  },
  {
    word: 'systems',
    candidates: [
      ['systems', 0.7],
      ['pipelines', 0.18],
      ['products', 0.12],
    ],
  },
  {
    word: 'for',
    candidates: [
      ['for', 0.88],
      ['across', 0.12],
    ],
  },
  {
    word: 'real-world',
    candidates: [
      ['real-world', 0.66],
      ['production', 0.21],
      ['everyday', 0.13],
    ],
  },
  {
    word: 'products',
    candidates: [
      ['products', 0.59],
      ['people', 0.27],
      ['teams', 0.14],
    ],
  },
  {
    word: 'and',
    candidates: [
      ['and', 0.94],
      ['&', 0.06],
    ],
  },
  {
    word: 'financial',
    candidates: [
      ['financial', 0.72],
      ['Indian', 0.18],
      ['live', 0.1],
    ],
  },
  {
    word: 'markets.',
    candidates: [
      ['markets.', 0.8],
      ['systems.', 0.12],
      ['decisions.', 0.08],
    ],
  },
];
