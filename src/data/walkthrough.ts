// A real input traced through a project, shown on its case study as a pinned, scroll-driven
// walkthrough (components/Walkthrough.tsx). Everything here comes from an actual run.
//
// FinSight: the chunks and similarity scores are its retrieval output (local BGE embeddings,
// ChromaDB, k = 5, company = TCS) and the answer is Llama 3's, word for word, from the evaluation
// saved on 10 Oct 2026. Citations in the answer are written [[p.N]] and drawn as chips.
//
// VoiceNote AI: the clip is from Google's crowd-sourced Tamil speech data (CC BY-SA 4.0), run
// through the live Hugging Face Space on 12 Oct 2026. The transcript and romanization are its
// output, word for word; the reference is what the speaker read, from the same data set.

/** Every walkthrough has five steps; the rail and the scroll engine assume it. */
export type WalkthroughStep = { label: string; title: string; body: string; facts: string[] };
type Steps = [WalkthroughStep, WalkthroughStep, WalkthroughStep, WalkthroughStep, WalkthroughStep];

type Base = {
  /** One line above the walkthrough, saying what it shows and where the data comes from. */
  intro: string;
  steps: Steps;
  /** The step whose text types out with the scroll. */
  typeStep: number;
  /** The step whose list arrives item by item. */
  listStep: number;
  /** Attribution for third-party material shown in the walkthrough. */
  credit?: { text: string; href: string };
};

export type WalkthroughHit = { page: number; score: number; text: string };

export type RagWalkthrough = Base & {
  kind: 'rag';
  question: string;
  company: string;
  document: { file: string; pages: number; page: number; section: string; highlight: string };
  chunking: { model: string; dims: number };
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

export type SpeechWalkthrough = Base & {
  kind: 'speech';
  audio: {
    /** Path under public/: the clip at 16 kHz, as Whisper hears it. */
    src: string;
    seconds: number;
    sampleRateIn: number;
    samplesIn: number;
    samples16k: number;
    /** Peak level per slice of the clip, 0 to 1, for the waveform. */
    peaks: number[];
    speaker: string;
  };
  model: string;
  chunkSeconds: number;
  /** Whisper's Tamil output, word for word. */
  transcript: string;
  /** Tamil word → its romanization, as VoiceNote returned it. */
  romanized: [string, string][];
  /** One word broken into the graphemes the romanizer maps. */
  graphemes: { word: string; parts: [string, string][] };
  /** What the speaker read; [[x]] marks text VoiceNote's transcript lacks. */
  reference: string;
  errors: { chars: number; charTotal: number; words: number; wordTotal: number };
  latencySeconds: number;
  /** What happened on other clips, for honesty about this one being a good case. */
  otherClips: string;
};

export type Walkthrough = RagWalkthrough | SpeechWalkthrough;

export const walkthroughs: Record<string, Walkthrough> = {
  'fin-sight': {
    kind: 'rag',
    intro:
      'One real question, traced end to end as you scroll. The chunks, scores and answer are from an actual run.',
    typeStep: 4,
    listStep: 3,
    steps: [
      {
        label: 'Ask',
        title: 'A question an analyst would ask.',
        body: 'Not "what was the margin", but what drove it and what held it back. The answer sits in one paragraph of a 360-page report.',
        facts: ['company = TCS'],
      },
      {
        label: 'Parse',
        title: 'Every page, read as text.',
        body: 'PyMuPDF reads the PDF page by page and keeps each page number, so any answer can point back to where it came from.',
        facts: ['360 pages', 'annual-report-2025-2026.pdf'],
      },
      {
        label: 'Chunk + embed',
        title: 'Pages become searchable meaning.',
        body: 'Each page is split into 1,000-character chunks that overlap by 150, and each chunk becomes a 384-number vector from a local embedding model. No API calls, no cost.',
        facts: ['1,315 TCS chunks', '3,044 in the index'],
      },
      {
        label: 'Retrieve',
        title: 'The right page comes first.',
        body: 'The question becomes a vector too. ChromaDB returns the five closest chunks, filtered to TCS. Page 24, where the answer lives, ranks first.',
        facts: ['top 5 of 1,315', 'rank 1 = answer page'],
      },
      {
        label: 'Answer + cite',
        title: 'An answer you can check.',
        body: 'Llama 3 answers only from those five chunks and cites the page for each claim. The sentence it relied on is right there on p.24.',
        facts: ['7.2 s, run locally', '₹0 per question'],
      },
    ],
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
    chunking: { model: 'BAAI/bge-small-en-v1.5', dims: 384 },
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
  'voicenote-ai': {
    kind: 'speech',
    intro:
      'One real voice note, traced end to end as you scroll. The transcript is from the live app; the audio is from an open Tamil speech data set.',
    typeStep: 2,
    listStep: 3,
    credit: {
      text: "Audio: Google's crowd-sourced Tamil speech data, CC BY-SA 4.0",
      href: 'https://huggingface.co/datasets/ylacombe/google-tamil',
    },
    steps: [
      {
        label: 'Listen',
        title: 'A real voice note, in Tamil.',
        body: 'Seven seconds of a speaker reading an everyday sentence, from an open Tamil speech data set. Play it, or scroll to move through it.',
        facts: ['7.08 s', '48 kHz mono'],
      },
      {
        label: 'Prepare',
        title: 'Audio, shaped for Whisper.',
        body: 'pydub resamples the clip to the 16 kHz Whisper expects and splits long recordings into 30-second chunks. This one fits in a single chunk.',
        facts: ['339,968 → 113,322 samples', '1 chunk'],
      },
      {
        label: 'Transcribe',
        title: 'Whisper hears Tamil.',
        body: "Whisper medium runs with the language set to Tamil, so it doesn't have to guess. Out comes Tamil script.",
        facts: ['whisper medium', 'language = ta'],
      },
      {
        label: 'Romanize',
        title: 'Readable in Latin letters.',
        body: "A small in-house romanizer maps each Tamil letter to Latin, for people who speak Tamil but don't read the script. Transliteration, not translation.",
        facts: ['7 words', 'no external API'],
      },
      {
        label: 'Check',
        title: 'Checked against a human transcript.',
        body: 'The data set says what the speaker actually read. VoiceNote missed one joining consonant: 2 of 70 characters.',
        facts: ['2.9% character error', '59 s on free CPU'],
      },
    ],
    audio: {
      src: 'projects/voicenote-sample.wav',
      seconds: 7.08,
      sampleRateIn: 48000,
      samplesIn: 339968,
      samples16k: 113322,
      speaker: 'female speaker 9705',
      peaks: [0.046, 0.044, 0.046, 0.044, 0.052, 0.046, 0.037, 0.046, 0.048, 0.039, 0.046, 0.044, 0.052, 0.05, 0.039, 0.046, 0.031, 0.056, 0.947, 1, 0.974, 0.84, 0.749, 0.914, 0.939, 0.887, 0.812, 0.638, 0.702, 0.917, 0.847, 0.79, 0.709, 0.304, 0.798, 0.637, 0.087, 0.693, 0.316, 0.724, 0.672, 0.62, 0.608, 0.543, 0.254, 0.529, 0.613, 0.565, 0.582, 0.666, 0.579, 0.417, 0.095, 0.115, 0.116, 0.062, 0.057, 0.898, 0.904, 0.125, 0.582, 0.629, 0.708, 0.704, 0.717, 0.647, 0.619, 0.169, 0.628, 0.775, 0.606, 0.454, 0.691, 0.693, 0.635, 0.757, 0.695, 0.754, 0.49, 0.585, 0.585, 0.569, 0.533, 0.052, 0.692, 0.63, 0.441, 0.072, 0.046, 0.05, 0.056, 0.044, 0.064, 0.042, 0.039, 0.052],
    },
    model: 'whisper medium',
    chunkSeconds: 30,
    transcript: 'உங்களுடைய உணவுக் கட்டுப்பாட்டை சொன்னால் மற்றவர்களுக்கும் உதவியாக இருக்கும்',
    romanized: [
      ['உங்களுடைய', 'ungkaLutaiya'],
      ['உணவுக்', 'uNavuk'],
      ['கட்டுப்பாட்டை', 'kattuppaattai'],
      ['சொன்னால்', 'sonnaal'],
      ['மற்றவர்களுக்கும்', 'maRRavarkaLukkum'],
      ['உதவியாக', 'utaviyaaka'],
      ['இருக்கும்', 'irukkum'],
    ],
    graphemes: {
      word: 'உணவுக்',
      parts: [
        ['உ', 'u'],
        ['ண', 'Na'],
        ['வு', 'vu'],
        ['க்', 'k'],
      ],
    },
    reference: 'உங்களுடைய உணவுக் கட்டுப்பாட்டை[[ச்]] சொன்னால் மற்றவர்களுக்கும் உதவியாக இருக்கும்',
    errors: { chars: 2, charTotal: 70, words: 1, wordTotal: 7 },
    latencySeconds: 59,
    otherClips:
      'On two other clips it heard ஒப்புக்கொண்டார் ("agreed") as உப்புக்கொண்டார் and wrote "thirteen" as 13.',
  },
};
