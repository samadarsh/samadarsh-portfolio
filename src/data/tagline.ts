// The hero tagline, word by word, with the alternatives shown when a visitor taps a word, in the
// style of a language model's next-token candidates. The first candidate of each word is the
// word itself, and the words join to exactly heroContent.tagline. Probabilities are for show.
// To change what a word offers, edit its list here.

export type TaglineToken = { word: string; candidates: [string, number][] };

export const taglineTokens: TaglineToken[] = [
  {
    word: 'From',
    candidates: [
      ['From', 0.92],
      ['Beyond', 0.08],
    ],
  },
  {
    word: 'research',
    candidates: [
      ['research', 0.46],
      ['prototype', 0.27],
      ['notebook', 0.19],
      ['hackathon', 0.08],
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
    word: 'production:',
    candidates: [
      ['production:', 0.71],
      ['scale:', 0.17],
      ['users:', 0.12],
    ],
  },
  {
    word: 'AI',
    candidates: [
      ['AI', 0.72],
      ['LLM', 0.17],
      ['autonomous', 0.11],
    ],
  },
  {
    word: 'agents',
    candidates: [
      ['agents', 0.68],
      ['systems', 0.2],
      ['products', 0.12],
    ],
  },
  {
    word: 'that',
    candidates: [
      ['that', 0.9],
      ['which', 0.1],
    ],
  },
  {
    word: 'act',
    candidates: [
      ['act', 0.55],
      ['decide', 0.2],
      ['ship', 0.15],
      ['work', 0.1],
    ],
  },
  {
    word: 'in',
    candidates: [
      ['in', 0.93],
      ['across', 0.07],
    ],
  },
  {
    word: 'the',
    candidates: [
      ['the', 0.97],
      ['this', 0.03],
    ],
  },
  {
    word: 'real',
    candidates: [
      ['real', 0.84],
      ['live', 0.1],
      ['physical', 0.06],
    ],
  },
  {
    word: 'world.',
    candidates: [
      ['world.', 0.86],
      ['economy.', 0.08],
      ['market.', 0.06],
    ],
  },
];
