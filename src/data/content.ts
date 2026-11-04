export type ProjectLinks = {
  live: string | null;
  github: string | null;
};

/** Animated cover for a project without a screenshot; see components/ProjectDemo.tsx. */
export type DemoKind = 'rag' | 'repo' | 'voice' | 'email';

export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  year: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
  links: ProjectLinks;
  cover?: string;
  /** Optional muted preview clip (webm/mp4 in public/), played on hover or when scrolled into view. */
  video?: string;
  /** Animated demo shown in place of a cover. */
  demo?: DemoKind;
  /** How the system fits together, in order, for the case-study page. */
  architecture?: { label: string; detail?: string }[];
  /** Measured results, shown on the case-study page. Only real, reproducible numbers. */
  results?: ProjectResults;
  accent: string;
};

export type ProjectResults = {
  /** What was measured and how, in one or two sentences. */
  setup: string;
  metrics: { value: string; label: string; detail?: string }[];
  /** Limits of the measurement, or what is still to come. */
  note?: string;
  /** Where the evaluation lives, so anyone can rerun it. */
  source?: { label: string; href: string };
};

export type JournalEntry = {
  title: string;
  date: string;
  tag: string;
  summary: string;
  href: string;
};

export type WritingMeta = {
  pageUrl: string;
  description: string;
};

export type ExperienceItem = {
  role: string;
  company: string;
  period: string;
  kind?: string;
  summary: string;
  points: string[];
};

export type EducationItem = {
  degree: string;
  school: string;
  period: string;
  note: string;
};

export type Publication = {
  title: string;
  /** The gallery card's headline: the title, shortened to read at a glance. */
  short: string;
  /** What the work does, in a sentence, for the detail sheet. Says only what the title states. */
  summary: string;
  /** Which drawing the gallery card shows. */
  figure: 'food' | 'music';
  /** Where it appeared, journal first. */
  venues: { kind: 'Journal' | 'Conference'; name: string }[];
  topics: string[];
  /** Year of publication, once confirmed. */
  year?: string;
  /** Optional link to the paper, if one is public. */
  href?: string;
};

export type OpenSourceFixId = 'kv' | 'cash' | 'feed' | 'ticks' | 'contract' | 'vm' | 'nav' | 'docs';

export type OpenSourceProject = {
  name: string;
  /** The name on the phone tab, under the owner line. */
  short: string;
  /** Shown above the short name on the phone tab; defaults to the GitHub owner. */
  org?: string;
  /** owner/name on GitHub. */
  repo: string;
  about: string;
};

export type OpenSourceFix = {
  id: OpenSourceFixId;
  /** Matches an OpenSourceProject name. */
  project: string;
  title: string;
  /** For the phone chip row. */
  short: string;
  before: string;
  after: string;
  tags: string[];
  /**
   * The pull requests behind the fix. The page links to the first and shows no number or
   * status; the status is here so Ask Ash never calls an open PR merged.
   */
  prs: { number: number; status: 'Merged' | 'Open' | 'Closed'; note?: string }[];
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export const heroContent = {
  eyebrow: 'AI Engineer · Agentic Systems',
  tagline: 'From research to production: AI agents that act in the real world.',
  location: 'Chennai, India',
  available: true,
};

export const stats = [
  { value: '7+', label: 'Shipped AI, data & client projects' },
  { value: '8.23', label: 'B.Tech CGPA · AI / DS' },
  { value: '2+', label: 'Years building & evaluating AI' },
  { value: '2', label: 'Research papers' },
] as const;

export const aboutNarrative = [
  'I build AI systems end to end — agents, retrieval (RAG) pipelines and speech tools — and measure how well they actually work.',
  'Lately that means agents that deploy code and triage tickets, retrieval with page citations across company annual reports, and Tamil speech recognition.',
  'Nearly two years evaluating frontier LLMs taught me how models fail, and how to show it reproducibly.',
];

export const experience: ExperienceItem[] = [
  {
    role: 'AI Engineer',
    company: 'Neeroma Technologies',
    period: 'Jun 2026 — Present',
    summary:
      'Working on Yantra, a multi-agent platform, evaluating LLM agent behaviour across design, deployment and ticketing workflows.',
    points: [
      'Debugged L5 Deploy Agent trajectories, tracing tool calls and reasoning steps to diagnose agent failures.',
      'Built L6 Tickets Agent triage logic and test cases exposing edge-case failures in agent decision-making.',
      'Verified QLearn AI tutor outputs for factual accuracy and grounding, flagging hallucinations in contextual Q&A.',
      'Used observability logs and regression tests to isolate the root causes of agent failures.',
    ],
  },
  {
    role: 'AI/ML Intern',
    company: 'Bae AI',
    period: 'Apr 2026 — Jun 2026',
    summary:
      'Built the BAExt Intent Engine, a deterministic pipeline that turns shopping queries into structured intent and ranked products without using an LLM, over a 1,200-SKU mock catalog.',
    points: [
      'Developed the MERN-stack architecture: intent parsing, 11-signal product ranking, answer generation, fallback handling and end-to-end response orchestration.',
      'Added query caching, eligibility filtering, grounded output validation and Docker Compose deployment, with performance benchmarking and 300-query stress tests.',
      'Ran 250+ automated tests and offline validation suites covering parser accuracy, ranking stability, response formatting and stress scenarios.',
    ],
  },
  {
    role: 'AI Benchmark Task Author',
    company: 'Mercor',
    period: 'Jun 2025 — Apr 2026',
    kind: 'Contract',
    summary:
      'Built evaluation benchmarks to test how frontier LLMs and tool-using AI agents handle multi-step research and reasoning, and to find where they fail.',
    points: [
      'Designed multi-hop retrieval and reasoning benchmarks that required models to connect facts across several sources, exposing failure modes in leading tool-using LLMs.',
      'Analyzed model run logs, tool-call traces and intermediate outputs to isolate the root cause of each failure, separating genuine model limitations from ambiguity in the task itself.',
      'Validated reproducible failures across repeated model runs, so each benchmark gave a consistent, reliable signal rather than one-off errors.',
      'Defined deterministic answer keys and evaluation criteria that let model responses be graded automatically and objectively.',
      'Turned validated failure patterns into new tasks across different domains, keeping task specifications precise and unambiguous.',
    ],
  },
  {
    role: 'AI Red-Teaming Specialist',
    company: 'Outlier',
    period: 'Jul 2024 — May 2025',
    kind: 'Contract',
    summary:
      'Authored model-breaking web-research tasks in the BrowseComp and GAIA formats, targeting frontier LLM failures.',
    points: [
      'Discovered obscure facts through OSINT and verified answer keys against primary sources and archives.',
      'Traced model search trajectories and reasoning chains to diagnose the root causes of task failures.',
      'Reviewed peer-authored tasks for ambiguity, answer uniqueness and source integrity before benchmark submission.',
    ],
  },
  {
    role: 'Machine Learning Intern',
    company: 'Sona Comstar',
    period: 'Jan 2023 — Mar 2023',
    summary:
      'Built and refined ML models for analytical workflows with a focus on reliability and clean data pipelines.',
    points: [
      'Developed regression models for practical analytical use cases.',
      'Performed preprocessing, feature engineering, and model evaluation.',
      'Built workflows turning raw data into actionable, automation-ready outputs.',
    ],
  },
];

export const education: EducationItem[] = [
  {
    degree: 'B.Tech in Artificial Intelligence & Data Science',
    school: 'Easwari Engineering College',
    period: '2020 — 2024',
    note: 'Graduated with CGPA 8.23. Foundation in machine learning, AI, and data-driven problem solving.',
  },
];

export const publications: Publication[] = [
  {
    title: 'An Integrated Framework for Food Recognition, Nutritional Insights, and Meal Recording',
    short: 'Food recognition, nutritional insights and meal recording.',
    summary:
      'One framework for three jobs: it recognises the food in a meal photo, works out its nutritional values and records the meal.',
    figure: 'food',
    venues: [
      { kind: 'Journal', name: 'Journal of Jilin University (Engineering and Technology Edition)' },
      {
        kind: 'Conference',
        name: '3rd International Conference on Deep Sciences for Computing and Communications',
      },
    ],
    topics: ['Computer vision', 'Nutrition', 'Deep learning'],
  },
  {
    title: 'Music Genre Classification by Deep Learning Techniques',
    short: 'Music genre classification with deep learning.',
    summary: 'Deep learning models that classify a piece of music into its genre from the audio.',
    figure: 'music',
    venues: [
      {
        kind: 'Conference',
        name: 'ISTE-sponsored International Conference on Latest Trends in Science, Engineering, and Technology',
      },
    ],
    topics: ['Audio', 'Deep learning', 'Classification'],
  },
];

// Fixes in other people's projects, told as what was broken and what changed (from the commit
// messages). Projects are listed in display order and fixes are grouped by project in the same
// order. When a PR's status changes, update it here; Ask Ash reads it.
export const openSourceProjects: OpenSourceProject[] = [
  {
    name: 'IBM Granite Switch',
    short: 'Granite Switch',
    org: 'IBM',
    repo: 'generative-computing/granite-switch',
    about: 'composable adapter models: LoRA adapters combined into one checkpoint and served on vLLM',
  },
  {
    name: 'OpenAlgo',
    short: 'OpenAlgo',
    repo: 'marketcalls/openalgo',
    about: 'an open-source algorithmic trading platform for Indian brokers',
  },
  {
    name: 'OpenClaw',
    short: 'OpenClaw',
    repo: 'openclaw/openclaw',
    about: 'an open-source personal AI assistant that runs on your own devices',
  },
];

export const openSource: OpenSourceFix[] = [
  {
    id: 'kv',
    project: 'IBM Granite Switch',
    title: 'Stopped a silent routing failure in vLLM.',
    short: 'vLLM routing',
    before:
      "With a float16 or fp8 KV cache, the switch's −1e9 routing mask became −inf. 0 × −inf is NaN, so every adapter was picked wrongly while the model kept generating normal-looking text.",
    after:
      'vLLM now refuses those caches at startup and names the flag to change. The check runs on CPU in the tests, along with the arithmetic it rests on.',
    tags: ['vLLM', 'LoRA routing', 'Numerics'],
    prs: [{ number: 157, status: 'Open' }],
  },
  {
    id: 'docs',
    project: 'IBM Granite Switch',
    title: 'Brought the developer docs back in line with the code.',
    short: 'Developer docs',
    before:
      "The developer guide still described SingleSwitch and a trainable router, both already removed, and its install command used an option that doesn't exist.",
    after: 'It now documents the coded-memory MultiSwitch, the correct install command and the audio setup.',
    tags: ['Docs', 'Developer experience'],
    prs: [{ number: 143, status: 'Merged' }],
  },
  {
    id: 'cash',
    project: 'OpenAlgo',
    title: 'Counted the money deposited today.',
    short: 'Same-day cash',
    before:
      'An account funded with ₹3,00,000 on top of ₹1,040 cash showed ₹1,040 available: Kotak keeps same-day deposits outside collateral until they settle.',
    after:
      "Available cash now adds the day's pay-in and subtracts the pay-out, so the figures add up to Kotak's own net balance. Covered by tests on two recorded responses.",
    tags: ['Broker API', 'Python', 'Tests'],
    prs: [{ number: 2233, status: 'Open' }],
  },
  {
    id: 'feed',
    project: 'OpenAlgo',
    title: 'Closed a race in the paper-trading feed.',
    short: 'Feed race',
    before:
      'A place and a cancel on two threads could change the subscriber count in one order and queue their feed calls in the other. The symbol stayed subscribed with nothing watching it.',
    after:
      'Each feed call is queued inside the same lock that changes the count, so the queue order always matches the count.',
    tags: ['Concurrency', 'WebSockets', 'Python'],
    prs: [{ number: 2192, status: 'Open' }],
  },
  {
    id: 'ticks',
    project: 'OpenAlgo',
    title: 'Put the real trade time on live ticks.',
    short: 'Trade time',
    before:
      "Zerodha ticks reported the exchange's packet time as the last-trade time, and read the real trade time as a price change: the timestamp divided by 100.",
    after:
      'Last-trade time is now parsed from its own bytes on Zerodha and Upstox ticks, and exchange time keeps its own field.',
    tags: ['Market data', 'Binary parsing'],
    prs: [{ number: 2170, status: 'Open' }],
  },
  {
    id: 'contract',
    project: 'OpenAlgo',
    title: 'Kept a login from loading a half-written contract.',
    short: 'Contract load',
    before:
      'A login during a forced re-download reset the running download and loaded the symbol cache from a table that was still being rewritten.',
    after:
      'A cached load now claims the broker the same way a download does, so the two never overlap. The running download loads the cache once it finishes.',
    tags: ['Race condition', 'Python'],
    prs: [{ number: 2133, status: 'Merged' }],
  },
  {
    id: 'nav',
    project: 'OpenAlgo',
    title: 'Fixed the navbar on 1280 to 1535px screens.',
    short: 'Navbar overflow',
    before:
      'Nine labelled items, the logo and the controls need 1,412px, but the page container gives 1,248px. Even after shrinking, the bar overflowed by 84px and clipped the logo.',
    after: 'The bar fits at every width in that range.',
    tags: ['Tailwind', 'Responsive UI'],
    prs: [{ number: 2119, status: 'Merged' }],
  },
  {
    id: 'vm',
    project: 'OpenClaw',
    title: 'Made the macOS VM setup work end to end.',
    short: 'macOS VM setup',
    before:
      'On a fresh macOS VM the install step failed because Node.js was never installed. Once it ran, the guide never said how to open the dashboard from the Mac.',
    after:
      "The guide installs Node.js first, then reaches the VM's dashboard through an SSH tunnel and a one-time pairing link.",
    tags: ['Docs', 'macOS', 'SSH'],
    prs: [
      { number: 160239, status: 'Merged' },
      { number: 162736, status: 'Closed', note: 'acknowledged by the maintainers' },
    ],
  },
];

export const projectOf = (fix: OpenSourceFix) =>
  openSourceProjects.find((p) => p.name === fix.project) as OpenSourceProject;

export const prUrl = (repo: string, n: number) => `https://github.com/${repo}/pull/${n}`;

export const skillGroups: SkillGroup[] = [
  {
    title: 'AI Engineering',
    items: [
      'AI Agents',
      'Multi-Agent Systems',
      'RAG Pipelines',
      'MCP & Tool Calling',
      'LLM Evaluation',
      'Streaming Inference',
    ],
  },
  {
    title: 'AI Evaluation',
    items: [
      'LLM Red-Teaming',
      'Adversarial Prompting',
      'BrowseComp & GAIA Tasks',
      'OSINT & Source Verification',
      'Trajectory Debugging',
      'Failure Analysis',
    ],
  },
  {
    title: 'LLMs & Frameworks',
    items: ['LangChain', 'LangGraph', 'Hugging Face', 'OpenAI API', 'Groq', 'Gemini', 'Ollama', 'Whisper'],
  },
  {
    title: 'Vector Search',
    items: ['Chroma', 'FAISS', 'Pinecone', 'Weaviate', 'BGE Embeddings'],
  },
  {
    title: 'Engineering',
    items: ['Python', 'TypeScript', 'FastAPI', 'Next.js', 'React', 'Node.js', 'SQL', 'Docker', 'Git'],
  },
  {
    title: 'Machine Learning',
    items: ['PyTorch', 'TensorFlow', 'Scikit-learn', 'NLP', 'Computer Vision', 'Pandas & NumPy'],
  },
  {
    title: 'Markets & Analytics',
    items: ['Algorithmic Trading', 'OpenAlgo', 'Backtesting', 'Time-Series Analysis', 'F&O Workflows', 'NISM Series VIII'],
  },
];

export const projects: Project[] = [
  {
    slug: 'redis-go',
    title: 'redis-go',
    eyebrow: 'Systems · Go',
    year: '2026',
    role: 'Solo Builder',
    summary:
      'A Redis-compatible key-value server built from scratch in Go that speaks the real Redis protocol, so it works with redis-cli.',
    highlights: [
      'Speaks the real Redis protocol (RESP), so it works with redis-cli; 17 commands implemented.',
      'Thread-safe store with TTL key expiry, and AOF persistence with crash recovery.',
      "About 90% of real Redis's throughput at 167k ops/sec, profiled with pprof.",
      '59 tests run under the race detector in CI on GitHub Actions, with zero dependencies.',
    ],
    stack: ['Go', 'TCP', 'Concurrency', 'RESP protocol', 'GitHub Actions'],
    links: { live: null, github: 'https://github.com/samadarsh/redis-go' },
    cover: 'projects/redis-go.webp',
    video: 'projects/redis-go.mp4',
    architecture: [
      { label: 'redis-cli', detail: 'The real Redis client' },
      { label: 'TCP + RESP', detail: 'The real Redis protocol, 17 commands' },
      { label: 'Thread-safe store', detail: 'With TTL key expiry' },
      { label: 'AOF persistence', detail: 'Crash recovery from the append-only file' },
    ],
    results: {
      setup:
        'redis-benchmark against redis-go and Redis 8.10.3 on the same Apple M3 Pro, both on localhost with persistence off: SET, GET, INCR and MSET, 1,000,000 requests from 50 clients, without and with pipelining (16 commands per round trip).',
      metrics: [
        { value: '93%', label: 'SET throughput vs Redis', detail: '167,280 vs 180,050 req/s' },
        { value: '88%', label: 'GET throughput vs Redis', detail: '167,140 vs 189,214 req/s' },
        { value: '2.3M', label: 'Pipelined GET req/s', detail: "104% of Redis's at 16 per round trip" },
        { value: '58%', label: 'Pipelined INCR vs Redis', detail: 'Number parsing under one write lock' },
      ],
      note: "Results vary by about ±10% between runs. Without pipelining the network round trip is the limit, not the server. Where redis-go beats Redis it is using about three cores (~310% CPU) to Redis's one, so per core Redis is more efficient.",
      source: {
        label: 'Method, full table and how to rerun it',
        href: 'https://github.com/samadarsh/redis-go#benchmarks',
      },
    },
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'bite-wise',
    title: 'BiteWise',
    eyebrow: 'AI Product · Swiggy Builders Club',
    year: '2026',
    role: 'Solo Builder',
    summary:
      'Approved Swiggy Builders Club project — a two-product food intelligence platform where NutriOrder AI powers nutrition-aware Swiggy ordering and SmartPantry AI handles household pantry, recipes, and grocery planning via Swiggy Food and Instamart MCP.',
    highlights: [
      'NutriOrder AI: ranks real Swiggy dishes on ten weighted factors (protein, calories, goal, diet, cuisine, budget, delivery time, rating, popularity and order history), drops anything that clashes with your allergies, and explains every score before a reviewed, confirmed checkout with live order tracking.',
      'SmartPantry AI: household profiles with each member’s diet and allergies, a pantry that tracks expiry, cook-today recipes from what’s in stock, a grocery list grouped by aisle, and an Instamart cart.',
      'Nutrition coach: calorie and protein targets from the Mifflin–St Jeor equation, meals logged by hand or by photo (Gemini vision), and weekly trends.',
      'Built on Swiggy MCP with OAuth 2.1 + PKCE and AES-256-GCM encrypted tokens. A real order must clear seven locks, including explicit confirmation, Swiggy’s Rs 1,000 cap, cash on delivery only and a duplicate-order guard.',
    ],
    stack: ['Next.js', 'FastAPI', 'Swiggy MCP', 'TypeScript', 'SQLAlchemy', 'PostgreSQL', 'Gemini', 'Tailwind'],
    links: {
      live: 'https://bite-wise-theta.vercel.app',
      github: 'https://github.com/samadarsh/BiteWise',
    },
    cover: 'projects/bite-wise.webp',
    video: 'projects/bite-wise.mp4',
    architecture: [
      { label: 'Next.js app', detail: 'NutriOrder AI + SmartPantry AI interfaces' },
      { label: 'FastAPI backend', detail: 'Ranking, allergen checks, pantry and order logic' },
      { label: 'OAuth 2.1 PKCE', detail: 'Per-user Swiggy auth, AES-256-GCM encrypted tokens' },
      { label: 'Swiggy MCP', detail: 'Food and Instamart, with retries, caching and seven locks before any real order' },
    ],
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'fin-sight',
    title: 'FinSight',
    eyebrow: 'AI · Financial RAG',
    year: '2026',
    role: 'Solo Builder',
    summary:
      'Local-first RAG system for financial PDFs — annual reports, earnings transcripts, and SEBI filings — with natural-language Q&A grounded in page-level citations.',
    highlights: [
      'End-to-end ingestion pipeline: PyMuPDF parsing, LangChain chunking, BGE embeddings, and persistent ChromaDB storage.',
      'FastAPI backend with Streamlit UI — upload, ingest, and query across companies with Ollama or Gemini LLM providers.',
      'Citation-aware answers with inline `[filename p.N]` references and post-processing when the model omits source tags.',
    ],
    stack: ['FastAPI', 'ChromaDB', 'PyMuPDF', 'LangChain', 'Streamlit', 'Ollama', 'Gemini'],
    links: { live: null, github: 'https://github.com/samadarsh/fin-sight' },
    demo: 'rag',
    architecture: [
      { label: 'Financial PDFs', detail: 'Annual reports, transcripts, SEBI filings' },
      { label: 'PyMuPDF + LangChain', detail: 'Parsing and chunking' },
      { label: 'BGE embeddings', detail: 'Stored in persistent ChromaDB' },
      { label: 'Ollama or Gemini', detail: 'Grounded answers via FastAPI + Streamlit' },
      { label: 'Cited answer', detail: 'Inline [filename p.N] references' },
    ],
    results: {
      setup:
        'Measured on 46 questions written from the TCS 2025-26 and IndianOil 2024-25 annual reports (833 pages, 3,044 chunks): 43 the reports answer and 3 they cannot. Local BGE embeddings retrieve the top 5 chunks, and Llama 3 (8B) on Ollama writes the answers.',
      metrics: [
        { value: '83.7%', label: 'Answer page in top 5', detail: '36 of 43 questions' },
        { value: '74.4%', label: 'Answers cite the right page', detail: '32 of 43 answers' },
        { value: '67.4%', label: 'Answers state every key figure', detail: '29 of 43 answers' },
        { value: '3 / 3', label: 'Unanswerable questions declined', detail: 'No invented figures' },
      ],
      note: 'Read by hand, 26 of the 43 answers are fully correct and 4 partly; 9 decline, mostly where retrieval missed the page, and 4 are wrong. Next: hybrid keyword search for infographic and table pages, and a larger model.',
      source: {
        label: 'Evaluation and question set',
        href: 'https://github.com/samadarsh/fin-sight/tree/master/eval',
      },
    },
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'voicenote-ai',
    title: 'VoiceNote AI',
    eyebrow: 'Speech AI · Tamil ASR',
    year: '2026',
    role: 'Solo Builder',
    summary:
      'Tamil voice-note pipeline that transcribes speech with Whisper and romanizes output into readable Latin script — script transliteration, not translation.',
    highlights: [
      'Whisper-medium ASR (language=ta) with browser mic capture, file upload, and pydub chunking for long recordings.',
      'Custom grapheme-level Tamil→ASCII romanizer with no external transliteration API.',
      'Dockerized Gradio app deployed on Hugging Face Spaces with env-configurable models and pytest coverage.',
    ],
    stack: ['Whisper', 'Gradio', 'pydub', 'Docker', 'Python'],
    links: {
      live: 'https://huggingface.co/spaces/samadarsh/voicenote-ai-transliteration',
      github: 'https://github.com/samadarsh/VoiceNote-AI',
    },
    demo: 'voice',
    architecture: [
      { label: 'Mic or upload', detail: 'Browser capture, pydub chunking' },
      { label: 'Whisper-medium', detail: 'Tamil ASR (language=ta)' },
      { label: 'Custom romanizer', detail: 'Grapheme-level Tamil → Latin script' },
      { label: 'Readable text', detail: 'Gradio app on Hugging Face Spaces' },
    ],
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'repomind',
    title: 'RepoMind',
    eyebrow: 'AI · Developer Tools',
    year: '2025',
    role: 'Solo Builder',
    summary:
      'Context-aware repository analysis that classifies project types and generates structured architectural insights using a multi-stage LLM workflow.',
    highlights: [
      'Multi-stage LLM pipeline with bias-control mechanisms for stable, structured outputs.',
      'Classifies repositories, summarizes architecture, and exports structured JSON.',
      'Streamlit interface with file-level analysis and configurable prompt scaffolding.',
    ],
    stack: ['Streamlit', 'LangChain', 'Groq', 'Python'],
    links: {
      live: 'https://repomind14.streamlit.app/',
      github: 'https://github.com/samadarsh/RepoMind',
    },
    demo: 'repo',
    architecture: [
      { label: 'Repository', detail: 'File-level analysis' },
      { label: 'Multi-stage LLM pipeline', detail: 'LangChain + Groq with bias control' },
      { label: 'Classification', detail: 'Project type and architecture summary' },
      { label: 'Structured JSON', detail: 'Exported from the Streamlit UI' },
    ],
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'genai-email',
    title: 'GenAI Email Generator',
    eyebrow: 'Applied GenAI · Outreach',
    year: '2024',
    role: 'Solo Builder',
    summary:
      'Cold-email generator that scrapes job listings, extracts requirements with Llama 3, matches them against a portfolio, and drafts personalized outreach in seconds.',
    highlights: [
      'Two-stage LLM chain: structured job extraction from scraped pages, then email generation with matched portfolio links.',
      'LangChain WebBaseLoader ingests career-page content; Groq-backed Llama 3.3-70b for near-instant inference.',
      'Streamlit workflow from job URL to ready-to-send draft — cutting manual outreach research and rewriting time.',
    ],
    stack: ['Streamlit', 'LangChain', 'Groq', 'Llama 3', 'Python'],
    links: { live: null, github: 'https://github.com/samadarsh/GenAI-Email-Generator' },
    demo: 'email',
    architecture: [
      { label: 'Job listing URL', detail: 'Scraped with LangChain WebBaseLoader' },
      { label: 'Llama 3.3 70B on Groq', detail: 'Structured requirement extraction' },
      { label: 'Portfolio match', detail: 'Relevant projects and links' },
      { label: 'Email draft', detail: 'Ready to send from Streamlit' },
    ],
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'oor-snacks',
    title: 'Oor Snacks',
    eyebrow: 'Product · D2C Storefront',
    year: '2025',
    role: 'Founder · Design & Full-Stack',
    summary:
      'Direct-to-consumer storefront for a Chennai heritage snack brand — brand identity, product pages, cart, checkout, and live orders from day one.',
    highlights: [
      'Cinematic scroll experience built with GSAP and Lenis for product storytelling.',
      'Supabase-backed order management with Row-Level Security and a live admin dashboard.',
      'End-to-end ownership: brand, UI, full-stack development, and production deployment.',
    ],
    stack: ['Vite', 'Supabase', 'GSAP', 'Lenis', 'Vanilla JS'],
    links: { live: 'https://oor-snacks.vercel.app', github: null },
    cover: 'projects/oor-snacks.webp',
    video: 'projects/oor-snacks.mp4',
    architecture: [
      { label: 'Vite storefront', detail: 'GSAP + Lenis scroll storytelling' },
      { label: 'Cart and checkout', detail: 'Live orders from day one' },
      { label: 'Supabase', detail: 'Row-Level Security on orders' },
      { label: 'Admin dashboard', detail: 'Live order management' },
    ],
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
  {
    slug: 'bluemoon-studio',
    title: 'Bluemoon Studio',
    eyebrow: 'Client Work · Photography Studio',
    year: '2026',
    role: 'Design & Full-Stack',
    summary:
      'Website for a Chennai wedding photography studio — curated portfolio collections, service pages, a full Instagram-fed gallery, and an enquiry flow that lands directly in the studio owner’s WhatsApp.',
    highlights: [
      'Six routes with per-collection portfolio pages and service detail pages, plus a keyboard-navigable lightbox gallery served newest-first from the studio’s Instagram.',
      'Zero-backend enquiry form: validated in-browser, then composed into a prefilled WhatsApp message or email draft — no form service, no lead sitting in an inbox nobody checks.',
      'Local SEO built for a business that lives in Google Maps results — PhotographyBusiness JSON-LD with address, hours and offers, generated sitemap and robots, per-page OG metadata.',
      'Hand-written CSS design system on tokenised type, colour and motion scales — editorial serif typography with no UI framework.',
    ],
    stack: ['React', 'React Router', 'Vite', 'Vanilla CSS', 'Schema.org', 'Netlify'],
    links: { live: 'https://bluemoon-studio.netlify.app', github: null },
    cover: 'projects/bluemoon-studio.webp',
    video: 'projects/bluemoon-studio.mp4',
    architecture: [
      { label: 'React + React Router', detail: 'Six routes: collections and service pages' },
      { label: 'Instagram-fed gallery', detail: 'Keyboard-navigable lightbox, newest first' },
      { label: 'Enquiry form', detail: 'Validated in the browser, no backend' },
      { label: 'WhatsApp or email', detail: 'Prefilled message straight to the owner' },
    ],
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
];

export const writingMeta: WritingMeta = {
  pageUrl: 'https://www.linkedin.com/showcase/haugtun/',
  description:
    'A research page where I publish structured notes on Indian markets, investing fundamentals, and how capital actually behaves in the real world.',
};

export const journalEntries: JournalEntry[] = [
  {
    title: 'Why Indian investors wake up watching Wall Street',
    date: 'May 2026',
    tag: 'Global Macro',
    summary:
      'Dow falls overnight, Nifty opens red — not coincidence. The channels wiring US markets to Indian equities (FII flows, the dollar, the Fed) and the five signals worth watching before the open.',
    href: 'https://www.linkedin.com/posts/haugtun_usmarkets-indianstockmarket-fii-activity-7466462230557925376-hSwq',
  },
  {
    title: 'How inflation quietly erodes your wealth',
    date: 'May 2026',
    tag: 'Inflation',
    summary:
      'Your salary went up 8%, inflation was 6% — the real story behind purchasing power, and which asset classes actually outpace it.',
    href: 'https://www.linkedin.com/posts/haugtun_inflation-investing-stockmarket-activity-7464210462306373632-DAsW',
  },
  {
    title: 'Why market crashes are not random',
    date: 'May 2026',
    tag: 'Risk',
    summary:
      '2008, COVID, the dot-com bust — every major crash followed the same recipe of overvaluation, leverage, and a catalyst. A field guide to preparing instead of panicking.',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7458800595991257089',
  },
  {
    title: 'Three numbers every investor should read before buying a share',
    date: 'May 2026',
    tag: 'Valuation',
    summary:
      'EPS, P/E, and P/B. Used in isolation, any one of them can mislead. Used together, they form the spine of every valuation framework worth using.',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7455884994930987008',
  },
  {
    title: 'The four phases every market moves through',
    date: 'Apr 2026',
    tag: 'Cycles',
    summary:
      'Accumulation, markup, distribution, markdown. Most retail investors buy in distribution and sell in markdown — knowing where you are matters more than timing.',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7450961796301033472',
  },
  {
    title: 'What is liquidity and why it matters',
    date: 'Apr 2026',
    tag: 'Markets',
    summary:
      'Liquidity is not the same as volume. A breakdown of what it really measures and why it quietly shapes every execution and exit.',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7446819442400964610',
  },
  {
    title: 'The Rule of 72: the simplest way to double your money',
    date: 'Mar 2026',
    tag: 'Compounding',
    summary:
      'A mental-math shortcut for estimating how long it takes capital to double — and how to use it to compare returns intuitively.',
    href: 'https://www.linkedin.com/feed/update/urn:li:activity:7442307088829095936',
  },
];

/** The site's public address. Change it here when moving to a custom domain. */
export const SITE_URL = 'https://samadarsh.vercel.app';

export const contact = {
  email: 'samadarsh14@gmail.com',
  resumeFile: 'Adarsh_S_Resume.pdf',
} as const;

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/samadarsh14' },
  { label: 'GitHub', href: 'https://github.com/samadarsh' },
  { label: 'Email', href: `mailto:${contact.email}` },
] as const;
