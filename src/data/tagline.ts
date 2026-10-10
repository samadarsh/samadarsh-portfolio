// The hero tagline, word by word, with the alternatives shown when a visitor taps a word, in the
// style of a language model's next-token candidates. The first candidate of each word is the
// word itself, and the words join to exactly heroContent.tagline. Probabilities are for show.
// To change what a word offers, edit its list here.

export type TaglineToken = { word: string; candidates: [string, number][] };

export const taglineTokens: TaglineToken[] = [
  {
    word: 'I',
    candidates: [
      ['I', 0.93],
      ['We', 0.07],
    ],
  },
  {
    word: 'take',
    candidates: [
      ['take', 0.52],
      ['ship', 0.21],
      ['bring', 0.17],
      ['move', 0.1],
    ],
  },
  {
    word: 'AI',
    candidates: [
      ['AI', 0.71],
      ['LLM', 0.18],
      ['autonomous', 0.11],
    ],
  },
  {
    word: 'agents',
    candidates: [
      ['agents', 0.67],
      ['systems', 0.19],
      ['products', 0.14],
    ],
  },
  {
    word: 'from',
    candidates: [
      ['from', 0.9],
      ['out of', 0.1],
    ],
  },
  {
    word: 'demo',
    candidates: [
      ['demo', 0.48],
      ['notebook', 0.27],
      ['prototype', 0.19],
      ['hackathon', 0.06],
    ],
  },
  {
    word: 'to',
    candidates: [
      ['to', 0.95],
      ['into', 0.05],
    ],
  },
  {
    word: 'production.',
    candidates: [
      ['production.', 0.69],
      ['real users.', 0.2],
      ['scale.', 0.11],
    ],
  },
];
