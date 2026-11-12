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
//
// BiteWise: one order run through its own FastAPI backend on 13 Oct 2026, in its mock-Swiggy mode
// (USE_MOCK_MCP=true). The tool calls, scores, explanation, guardrail checks and state transitions
// are the backend's responses; the restaurants and menu are its test fixtures, and no order reaches
// Swiggy.
//
// RepoMind: its own pipeline (chain.py, stage by stage) run on samadarsh/fin-sight on 13 Oct 2026
// with Groq's openai/gpt-oss-120b on the free tier. The counts, classification, file list,
// timings and one-line summary are its output; each file's gist condenses the purpose line
// RepoMind wrote for it.
//
// redis-go: the session recorded in the repo's demo.gif on 3 Nov 2026, redis-cli against redis-go
// on port 6380 with the AOF on. Every command, reply and log line is from that recording; the wire
// bytes are SET name sam in RESP, the encoding the README shows and the AOF stores.
//
// clox: the REPL session, zoo.lox and oops.lox are the repo's recorded demo (demo.tape), and their
// output is clox's own, rerun on 6 Nov 2026 at commit 34a073e. The bytecode and the stack after
// each instruction are what `make trace` prints for the README's square example, at that commit.

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
  /** A note under the chunks: `code` is drawn as code, then the text. */
  chunkNote: { code: string; text: string };
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
  /** What the speaker read; [[x]] marks the one place VoiceNote's transcript differs. */
  reference: string;
  errors: { chars: number; charTotal: number; words: number; wordTotal: number };
  latencySeconds: number;
};

export type AgentWalkthrough = Base & {
  kind: 'agent';
  /** What the user typed. */
  query: string;
  profile: {
    /** The onboarding answers, as short chips. */
    inputs: string[];
    /** The target calculation, one line per step: [what, result]. */
    math: [string, string][];
  };
  /** The MCP tool calls, in order; `fallback` marks the ones the agent fell back to. */
  tools: { call: string; result: string; empty?: boolean; fallback?: boolean }[];
  toolSummary: string;
  /** The ranked shortlist, best first; score out of 100, to one decimal. */
  ranked: { name: string; restaurant: string; protein: number; calories: number; price: number; score: number }[];
  /** How the winner scored on its heaviest factors (0 to 1), and each factor's weight. */
  factors: { name: string; weight: number; score: number }[];
  /** The winner's explanation, as the backend returned it. */
  explanation: string;
  /** The trade-off the backend flagged, in plain words. */
  tradeoff: string;
  /** Order states from cart review on. */
  flow: { state: string; detail: string }[];
  /** The states before cart review, shown compactly. */
  earlierStates: string[];
  /** Checks in front of the order, each tried in the run and each held. */
  guardrails: { name: string; detail: string }[];
};

export type RepoWalkthrough = Base & {
  kind: 'repo';
  repoUrl: string;
  model: string;
  /** A few of the files the clone finds, for the file list. */
  sampleFiles: string[];
  /** Files after each filtering pass: [what, count]. */
  funnel: [string, number][];
  /** What the filter drops and what it keeps. */
  ignored: string[];
  keptTypes: string[];
  /** The types the classifier chooses from, and its choice and reason. */
  types: string[];
  classification: string;
  reason: string;
  /** Files the analyzer ranked important, before the cap of ten. */
  candidates: number;
  /** The files explained in the map step: path and a condensed purpose. */
  explained: { path: string; gist: string }[];
  /** RepoMind's one-line summary of the repository, word for word. */
  summary: string;
  /** The sections of the final overview. */
  sections: string[];
  calls: number;
  seconds: number;
};

export type ServerWalkthrough = Base & {
  kind: 'server';
  /** The command that starts the server, and its log lines as [message, detail]. */
  start: { command: string; logs: [string, string][] };
  /** The command shown on the wire (encoded as RESP by the scene), and the replies redis-cli got. */
  wire: { command: string; replies: [string, string][] };
  /** The keys at the end of the session, as KEYS listed them: [key, value, note]. */
  keys: [string, string, string][];
  /** The writes the AOF holds, in order. */
  aof: { command: string; gist: string }[];
  /** The shutdown, from the server's log. */
  shutdown: { state: string; detail: string }[];
  /** The restart: commands replayed, how long the replay took and how long the server was down. */
  replay: { commands: number; micros: number; downSeconds: number };
  /** The replies after the restart, typed out with the scroll. */
  recovered: string;
  /** Each key before the stop and after the restart: [key, before, after]. */
  survived: [string, string, string][];
  /** Facts about the binary, shown under its start-up log. */
  traits: string[];
};

export type VmWalkthrough = Base & {
  kind: 'vm';
  /** The REPL session: each line is what was typed (`in`) or what clox printed (`out`). */
  repl: { command: string; lines: { in?: string; out?: string }[] };
  /** A program and its bytecode, as `make trace` prints it: [offset, source line, op, operand]. */
  compile: { source: string[]; chunks: { name: string; code: [string, string, string, string][] }[]; note: string };
  /** The same program run one instruction at a time, with the stack after each one. */
  run: {
    fn: string;
    at: string;
    op: string;
    stack: string[];
    /** The stack slot where the running function's window starts. */
    frame: number;
    /** What the instruction printed. */
    out?: string;
  }[];
  objects: { file: string; source: string[]; output: string };
  error: { command: string; source: string[]; lines: string[]; exitCode: number };
  traits: string[];
};

export type Walkthrough =
  | VmWalkthrough
  | RagWalkthrough
  | SpeechWalkthrough
  | AgentWalkthrough
  | RepoWalkthrough
  | ServerWalkthrough;

/** The text the typing step types out. */
export const typedText = (w: Walkthrough) =>
  w.kind === 'rag'
    ? w.answer
    : w.kind === 'speech'
      ? w.transcript
      : w.kind === 'agent'
        ? w.explanation
        : w.kind === 'server'
          ? w.recovered
          : w.kind === 'vm'
            ? w.objects.output
            : w.summary;

export const walkthroughs: Record<string, Walkthrough> = {
  clox: {
    kind: 'vm',
    intro:
      'Real programs, traced through clox as you scroll. The REPL session and the demo programs are the ones recorded in the repo, and the bytecode and the stack are what clox’s own trace prints.',
    typeStep: 3,
    listStep: 1,
    steps: [
      {
        label: 'REPL',
        title: 'A language, and the machine that runs it.',
        body: 'clox compiles a full programming language to bytecode and runs it on its own virtual machine, in about 2,600 lines of C with no dependencies. Its REPL compiles and runs one line at a time.',
        facts: ['~2,600 lines of C', 'no dependencies'],
      },
      {
        label: 'Compile',
        title: 'Source in, bytecode out.',
        body: 'A single-pass Pratt parser writes bytecode as it parses. Local variables become stack-slot numbers at compile time, so n costs no lookup when it runs; square is a global, so it is looked up by name.',
        facts: ['single-pass Pratt parser', 'printed by make trace'],
      },
      {
        label: 'Run',
        title: 'Step through it, one instruction at a time.',
        body: 'The VM reads an instruction and runs it on a stack of values. OP_CALL gives square a window on that stack, so the argument 3 is already its local n, with no copy. Scroll to step through the run, the way the playground’s time-travel debugger does.',
        facts: ['14 instructions', 'prints 10'],
      },
      {
        label: 'Objects',
        title: 'Classes, inheritance and closures.',
        body: 'Dog inherits from Animal and calls its speak through super. counter returns a closure that keeps count alive after counter has returned. Objects live on the heap, and a mark-sweep collector frees what nothing reaches once the heap has doubled.',
        facts: ['Dog < Animal', 'GC stress-tested on every allocation'],
      },
      {
        label: 'Fail',
        title: 'When it fails, it says where.',
        body: 'A runtime error stops the program with a message and a stack trace, one line per call, then exits with code 70. The bytecode keeps the source line of every byte, so each frame names its line.',
        facts: ['3 frames', 'exit code 70'],
      },
    ],
    repl: {
      command: './build/release/clox',
      lines: [
        { in: 'var greeting = "Hello";' },
        { in: 'print greeting + ", Lox!";' },
        { out: 'Hello, Lox!' },
        { in: 'fun square(x) { return x * x; }' },
        { in: 'print square(12);' },
        { out: '144' },
      ],
    },
    compile: {
      source: ['fun square(n) {', '  return n * n;', '}', 'print square(3) + 1;'],
      chunks: [
        {
          name: '<script>',
          code: [
            ['0000', '3', 'OP_CLOSURE', "1 <fn square>"],
            ['0002', '|', 'OP_DEFINE_GLOBAL', "0 'square'"],
            ['0004', '4', 'OP_GET_GLOBAL', "0 'square'"],
            ['0006', '|', 'OP_CONSTANT', "2 '3'"],
            ['0008', '|', 'OP_CALL', '1'],
            ['0010', '|', 'OP_CONSTANT', "3 '1'"],
            ['0012', '|', 'OP_ADD', ''],
            ['0013', '|', 'OP_PRINT', ''],
            ['0014', '5', 'OP_NIL', ''],
            ['0015', '|', 'OP_RETURN', ''],
          ],
        },
        {
          name: 'square',
          code: [
            ['0000', '2', 'OP_GET_LOCAL', '1'],
            ['0002', '|', 'OP_GET_LOCAL', '1'],
            ['0004', '|', 'OP_MULTIPLY', ''],
            ['0005', '|', 'OP_RETURN', ''],
            ['0006', '3', 'OP_NIL', ''],
            ['0007', '|', 'OP_RETURN', ''],
          ],
        },
      ],
      note: 'n is local slot 1 (slot 0 holds the function being called), and OP_CALL 1 calls whatever sits one slot below the single argument.',
    },
    run: [
      { fn: 'script', at: '0000', op: 'OP_CLOSURE 1 <fn square>', stack: ['<script>', '<fn square>'], frame: 0 },
      { fn: 'script', at: '0002', op: "OP_DEFINE_GLOBAL 0 'square'", stack: ['<script>'], frame: 0 },
      { fn: 'script', at: '0004', op: "OP_GET_GLOBAL 0 'square'", stack: ['<script>', '<fn square>'], frame: 0 },
      { fn: 'script', at: '0006', op: "OP_CONSTANT 2 '3'", stack: ['<script>', '<fn square>', '3'], frame: 0 },
      { fn: 'script', at: '0008', op: 'OP_CALL 1', stack: ['<script>', '<fn square>', '3'], frame: 1 },
      { fn: 'square', at: '0000', op: 'OP_GET_LOCAL 1', stack: ['<script>', '<fn square>', '3', '3'], frame: 1 },
      { fn: 'square', at: '0002', op: 'OP_GET_LOCAL 1', stack: ['<script>', '<fn square>', '3', '3', '3'], frame: 1 },
      { fn: 'square', at: '0004', op: 'OP_MULTIPLY', stack: ['<script>', '<fn square>', '3', '9'], frame: 1 },
      { fn: 'square', at: '0005', op: 'OP_RETURN', stack: ['<script>', '9'], frame: 0 },
      { fn: 'script', at: '0010', op: "OP_CONSTANT 3 '1'", stack: ['<script>', '9', '1'], frame: 0 },
      { fn: 'script', at: '0012', op: 'OP_ADD', stack: ['<script>', '10'], frame: 0 },
      { fn: 'script', at: '0013', op: 'OP_PRINT', stack: ['<script>'], frame: 0, out: '10' },
      { fn: 'script', at: '0014', op: 'OP_NIL', stack: ['<script>', 'nil'], frame: 0 },
      { fn: 'script', at: '0015', op: 'OP_RETURN', stack: [], frame: 0 },
    ],
    objects: {
      file: 'demo/zoo.lox',
      source: [
        'class Animal {',
        '  init(name) { this.name = name; }',
        '  speak() { return this.name + " makes a sound"; }',
        '}',
        'class Dog < Animal {',
        '  speak() { return super.speak() + ": woof!"; }',
        '}',
        'fun counter() {',
        '  var count = 0;',
        '  fun next() { count = count + 1; return count; }',
        '  return next;',
        '}',
        'var tick = counter();',
        'print Dog("Rex").speak();',
        'print tick();',
        'print tick();',
      ],
      output: 'Rex makes a sound: woof!\n1\n2',
    },
    error: {
      command: './build/release/clox demo/oops.lox',
      source: [
        'fun area(width, height) {',
        '  return width * height;',
        '}',
        '',
        'fun describe(shape) {',
        '  return "area: " + area(shape, "tall");',
        '}',
        '',
        'print describe(3);',
      ],
      lines: ['Operands must be numbers.', '[line 2] in area()', '[line 6] in describe()', '[line 9] in script'],
      exitCode: 70,
    },
    traits: ['C, no dependencies', '246/246 official tests', 'NaN-boxed values'],
  },
  'redis-go': {
    kind: 'server',
    intro:
      'One real session, traced as you scroll: the demo recorded in the repo, from a cold start to a restart that keeps the data. Every command, reply and log line below is from that run.',
    typeStep: 4,
    listStep: 3,
    steps: [
      {
        label: 'Start',
        title: 'A Redis server, written from scratch.',
        body: 'One Go binary with zero dependencies. Started with persistence on, it replays its append-only file, empty the first time, then listens for any Redis client.',
        facts: ['port 6380', 'AOF loaded in 13 µs'],
      },
      {
        label: 'Speak RESP',
        title: 'The real Redis client talks to it.',
        body: 'redis-cli sends each command in RESP, the Redis wire protocol: an array of length-prefixed strings. One goroutine per client reads the bytes and turns them into a command.',
        facts: ['SET name sam → OK', 'GET name → "sam"'],
      },
      {
        label: 'Store',
        title: 'Counters, and keys that expire.',
        body: 'INCR runs under the store’s write lock, so two clients can’t lose an update. A key set with EX 60 starts counting down, and KEYS lists all three.',
        facts: ['INCR visits → 2', 'TTL session → 58'],
      },
      {
        label: 'Stop',
        title: 'Stop it. Every write is on disk.',
        body: 'Each write was appended to the AOF as it ran, under the store’s lock. Stopping the server lets in-flight commands finish, then flushes the file and closes it.',
        facts: ['4 writes logged', 'AOF flushed and closed'],
      },
      {
        label: 'Recover',
        title: 'Start it again. Nothing is lost.',
        body: 'On restart the AOF is replayed before the server takes connections, so every key comes back. The session kept its expiry too: 58 seconds left before the restart, 37 after.',
        facts: ['4 commands replayed in 252 µs', 'down for 7 s'],
      },
    ],
    start: {
      command: '/tmp/redis-go-demo -addr :6380 -aof /tmp/redis-go-demo.aof',
      logs: [
        ['AOF loaded', '0 commands · 13 µs'],
        ['persistence enabled', 'appendfsync = everysec'],
        ['ready to accept connections', 'addr = [::]:6380'],
      ],
    },
    wire: {
      command: 'SET name sam',
      replies: [
        ['SET name sam', 'OK'],
        ['GET name', '"sam"'],
      ],
    },
    keys: [
      ['name', '"sam"', 'SET name sam'],
      ['visits', '2', 'INCR visits, twice'],
      ['session', '"abc"', 'SET with EX 60 · TTL 58 s'],
    ],
    aof: [
      { command: 'SET name sam', gist: 'write 1' },
      { command: 'INCR visits', gist: 'write 2' },
      { command: 'INCR visits', gist: 'write 3' },
      { command: 'SET session abc', gist: 'write 4, with its expiry' },
    ],
    shutdown: [
      { state: 'shutting down', detail: 'kill %1 · in-flight commands finish' },
      { state: 'AOF flushed and closed', detail: 'then the process exits' },
    ],
    replay: { commands: 4, micros: 252, downSeconds: 7 },
    recovered: 'GET name → "sam" · GET visits → "2" · TTL session → 37',
    survived: [
      ['name', '"sam"', '"sam"'],
      ['visits', '2', '"2"'],
      ['session TTL', '58 s', '37 s'],
    ],
    traits: ['one Go binary', 'zero dependencies', 'fsync every second'],
  },
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
    chunkNote: {
      code: 'company · page · source',
      text: 'travel with every chunk, so retrieval filters to TCS and answers cite their page.',
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
      text: "Audio: Google's Tamil speech data, CC BY-SA 4.0",
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
        body: 'The data set says what the speaker actually read. VoiceNote matches 68 of its 70 characters; the only difference is one joining consonant.',
        facts: ['97.1% of characters exact', 'runs on free CPU'],
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
  },
  'bite-wise': {
    kind: 'agent',
    intro:
      "One real order, traced end to end as you scroll. Recorded on BiteWise's own backend against its sandbox Swiggy menu, so no real order was placed.",
    typeStep: 3,
    listStep: 2,
    steps: [
      {
        label: 'Profile',
        title: 'Targets from the body, not a guess.',
        body: 'Age, height, weight, activity and goal go through the Mifflin-St Jeor formula. Fat loss takes 500 kcal off the day, and the day is split into three meals.',
        facts: ['475 kcal · 45 g a meal', 'Rs 300 budget'],
      },
      {
        label: 'Search',
        title: 'It reaches for tools, and adapts.',
        body: 'The agent calls Swiggy\'s MCP tools. No dish is called "high protein meal", so instead of giving up it searches restaurants and reads their menus.',
        facts: ['5 tool calls', '6 dishes found'],
      },
      {
        label: 'Rank',
        title: 'Ten factors, one match score.',
        body: 'Every dish is scored on protein density, calories against the target, the goal, diet, cuisine, budget, delivery time, rating, popularity and order history, weighted into one match score. Missing data scores neutral, never invented.',
        facts: ['top 5 of 6', '39 ms a search'],
      },
      {
        label: 'Explain',
        title: 'Reasons you can check.',
        body: "The explanation is built from the same numbers that ranked the dish, so it can't disagree with them, and any trade-off is said out loud.",
        facts: ['no LLM in the ranking', 'trade-offs stated'],
      },
      {
        label: 'Confirm',
        title: 'Nothing is ordered until you say so.',
        body: "Every step is a state the backend checks and records. A real order has to clear seven locks; this run tested two of them: you have to confirm it, and the live cart has to stay under Swiggy's Rs 1,000 cap.",
        facts: ['9 recorded transitions', '2 guardrails tested, both held'],
      },
    ],
    query: 'high protein meal',
    profile: {
      inputs: ['30 years', 'female', '165 cm', '68 kg', 'light activity', 'fat loss'],
      math: [
        ['BMR · Mifflin-St Jeor', '1,400 kcal'],
        ['× 1.375 light activity', '1,925 kcal'],
        ['− 500 for fat loss', '1,425 kcal a day'],
        ['68 kg × 2.0 g protein', '136 g a day'],
        ['÷ 3 meals', '475 kcal · 45 g'],
      ],
    },
    tools: [
      { call: 'search_menu("high protein meal")', result: '0 dishes', empty: true },
      { call: 'search_restaurants("high protein meal")', result: '3 restaurants', fallback: true },
      { call: 'get_restaurant_menu(Protein Bowl Co)', result: '2 dishes', fallback: true },
      { call: 'get_restaurant_menu(Lean Meal Hub)', result: '2 dishes', fallback: true },
      { call: 'get_restaurant_menu(Fit Feast Kitchen)', result: '2 dishes', fallback: true },
    ],
    toolSummary: '6 candidates · 5 tool calls · 0 failures',
    ranked: [
      { name: 'Peri Peri Chicken Salad', restaurant: 'Fit Feast Kitchen', protein: 36, calories: 440, price: 299, score: 70.6 },
      { name: 'Grilled Chicken Rice Bowl', restaurant: 'Protein Bowl Co', protein: 42, calories: 580, price: 289, score: 67.2 },
      { name: 'Paneer Power Bowl', restaurant: 'Protein Bowl Co', protein: 31, calories: 530, price: 249, score: 64.8 },
      { name: 'Tofu Burrito Bowl', restaurant: 'Lean Meal Hub', protein: 27, calories: 400, price: 219, score: 63.7 },
      { name: 'High Protein Soya Salad', restaurant: 'Fit Feast Kitchen', protein: 29, calories: 275, price: 199, score: 62.2 },
    ],
    factors: [
      { name: 'Protein density', weight: 0.2, score: 0.576 },
      { name: 'Fitness goal', weight: 0.2, score: 0.667 },
      { name: 'Calories', weight: 0.15, score: 0.853 },
      { name: 'Diet', weight: 0.15, score: 1 },
      { name: 'Budget', weight: 0.1, score: 0.601 },
    ],
    explanation:
      'Provides 36g protein, close to your 45g target. Estimated 440 kcal, aligns well with your 475 kcal target. Priced at Rs 299, fits within your default budget of Rs 300.',
    tradeoff: "Macros are estimated from the dish's ingredients, and labelled as estimates.",
    earlierStates: ['START', 'ADDRESS_SELECTED', 'SEARCHING', 'RECOMMENDATIONS_READY', 'ITEM_SELECTED', 'CART_UPDATED'],
    flow: [
      { state: 'CART_REVIEW_READY', detail: 'Rs 299 · cash on delivery' },
      { state: 'USER_CONFIRMED', detail: 'you confirm the order' },
      { state: 'ORDER_PLACING', detail: 'live cart re-checked: Rs 299' },
      { state: 'ORDER_PLACED', detail: 'placed in 50 ms' },
    ],
    guardrails: [
      { name: 'Confirmation gate', detail: 'An order sent before you confirm is turned away.' },
      { name: 'Rs 1,000 spend cap', detail: 'Tested with a Rs 1,196 cart: stopped before placing.' },
    ],
  },
  repomind: {
    kind: 'repo',
    intro:
      'One real analysis, traced end to end as you scroll: RepoMind reading FinSight, another project on this page. Every stage below is its own output.',
    typeStep: 4,
    listStep: 3,
    steps: [
      {
        label: 'Clone',
        title: 'Any GitHub repo, one link.',
        body: 'Paste a repository URL. RepoMind shallow-clones it into a temporary folder, walks every file and pulls out the README for context.',
        facts: ['98 files found', 'cloned in 1.1 s'],
      },
      {
        label: 'Filter',
        title: 'Noise out, code in.',
        body: 'Version control, virtual environments, dependencies, images and data files are dropped. Source code, notebooks and docs stay.',
        facts: ['98 → 61 files', 'no LLM needed'],
      },
      {
        label: 'Classify',
        title: 'It works out what the repo is.',
        body: 'The name, the file list and the README go to the classifier, which picks one of eight project types and says why. Every later step is told the answer.',
        facts: ['Web Application', '1 LLM call'],
      },
      {
        label: 'Map',
        title: 'Every key file, explained in context.',
        body: "The analyzer ranks the files and the top ten are explained one by one. Each prompt carries the repo's name and type, and is told not to judge the whole project from one file.",
        facts: ['top 10 of 31 key files', 'one call per file'],
      },
      {
        label: 'Reduce',
        title: 'One overview, in fixed sections.',
        body: "The file explanations and the README are reduced into one structured overview: what the repo does, its workflow, architecture, features and a one-line summary.",
        facts: ['11 sections', '172 s on the free tier'],
      },
    ],
    repoUrl: 'github.com/samadarsh/fin-sight',
    model: 'gpt-oss-120b · groq',
    sampleFiles: [
      'api/main.py',
      'frontend/app.py',
      'src/finsight/pipeline/query_pipeline.py',
      'src/finsight/retrieval/retriever.py',
      'src/finsight/vectorstore/chroma_store.py',
      'src/finsight/embeddings/local.py',
      'scripts/evaluate.py',
      'README.md',
    ],
    funnel: [
      ['in the clone', 98],
      ['after ignore rules', 66],
      ['source and docs kept', 61],
    ],
    ignored: ['.git', 'venv', 'node_modules', '__pycache__', '.env', 'images', '.csv'],
    keptTypes: ['.py', '.ts', '.js', '.ipynb', '.md'],
    types: [
      'Portfolio Website',
      'Machine Learning Project',
      'Web Application',
      'Library/SDK',
      'Script Collection',
      'Data Science Notebook',
      'Backend API',
      'Unknown',
    ],
    classification: 'Web Application',
    reason:
      'The repository implements a full RAG system with a FastAPI backend, Streamlit frontend, and supporting scripts for ingestion and querying, indicating a complete web application rather than just an API or library.',
    candidates: 31,
    explained: [
      { path: 'README.md', gist: 'what FinSight does, how it is built and how to run it' },
      { path: 'api/main.py', gist: 'the HTTP API: upload PDFs, ingest them, run RAG queries' },
      { path: 'frontend/app.py', gist: 'the Streamlit app: connect, upload, ingest and ask' },
      { path: 'src/finsight/evaluation.py', gist: 'scores retrieval hits, citations, facts and refusals' },
      { path: 'src/finsight/errors.py', gist: 'custom errors for AI-service and embedding problems' },
      { path: 'src/finsight/models.py', gist: 'the data structures that travel through the pipeline' },
      { path: 'src/finsight/llm/factory.py', gist: 'one cached entry point to the configured LLM' },
      { path: 'src/finsight/llm/base.py', gist: 'the interface every LLM provider implements' },
      { path: 'src/finsight/llm/gemini.py', gist: "a provider for Google's Gemini models" },
    ],
    summary:
      'FinSight is a modular RAG system that ingests financial PDFs, stores chunk embeddings in ChromaDB, and delivers citation-rich answers via configurable LLM backends through a FastAPI-Streamlit interface.',
    sections: [
      'Overview',
      'What it does',
      'Core workflow',
      'Architecture',
      'Key features',
      'Strengths',
      'Improvements',
      'Upgrades',
      'Applications',
      'Tech concepts',
      'One-line summary',
    ],
    calls: 12,
    seconds: 172,
  },
};
