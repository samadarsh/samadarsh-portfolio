export type ProjectLinks = {
  live: string | null;
  github: string | null;
};

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
  /** How the system fits together, in order, for the case-study page. */
  architecture?: { label: string; detail?: string }[];
  accent: string;
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
  /** Where it appeared, journal first. */
  venues: { kind: 'Journal' | 'Conference'; name: string }[];
  topics: string[];
  /** Optional link to the paper, if one is public. */
  href?: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export const heroContent = {
  eyebrow: 'AI · Systems · Capital',
  tagline:
    'Building AI and data systems for real-world products and financial markets.',
  location: 'Chennai, India',
  available: true,
};

export const stats = [
  { value: '7+', label: 'Shipped AI, data & client projects' },
  { value: '8.23', label: 'B.Tech CGPA · AI / DS' },
  { value: '3+', label: 'Years across markets & data' },
  { value: '2', label: 'Research papers' },
] as const;

export const aboutNarrative = [
  'I build and study systems shaped by data, behavior, and decision-making — spanning AI workflows, machine learning, and financial markets.',
  'Working close to both technology and live market environments has influenced the way I think: structured, analytical, and grounded in real-world constraints.',
  'Currently exploring applied GenAI, LLM workflows, and data-driven systems.',
];

export const experience: ExperienceItem[] = [
  {
    role: 'AI Engineer',
    company: 'Neeroma Technologies',
    period: 'Jun 2026 — Present',
    summary:
      'Worked on Yantra, a multi-agent software engineering platform covering design, development, deployment, ticketing, and marketing.',
    points: [
      'Implemented and enhanced the L5 Deploy Agent for automated deployment workflows and engineering operations.',
      'Developed the L6 Tickets Agent with ticket triage, support workflows, permissions, SLA handling, and engineering hand-off.',
      'Built and enhanced QLearn AI Classroom features for AI tutoring, contextual Q&A, content generation, and adaptive learning.',
      'Resolved platform issues across browser automation, audio infrastructure, UI workflows, observability, and testing.',
    ],
  },
  {
    role: 'AI/ML Intern',
    company: 'Bae AI',
    period: 'May 2026 — Jun 2026',
    summary:
      'Built an AI-powered intent engine that transformed natural language shopping queries into structured recommendations.',
    points: [
      'Developed recommendation and response orchestration pipelines using TypeScript, Node.js, React, MongoDB, and Express.js.',
      'Implemented ranking algorithms and retrieval workflows to enhance recommendation accuracy and relevance.',
      'Executed 250+ automated tests and managed performance benchmarking and Docker-based deployments.',
    ],
  },
  {
    role: 'Authorised Person',
    company: 'Angel One',
    period: 'Jan 2025 — May 2026',
    kind: 'Proprietorship',
    summary:
      'Managed trading operations and client workflows while maintaining structured financial and transactional datasets.',
    points: [
      'Applied quantitative and time-series analysis to market and portfolio data for opportunity identification and decision support.',
      'Developed algorithmic trading systems using OpenAlgo to automate execution and strategy management processes.',
      'Generated performance analytics and maintained trading datasets for portfolio monitoring and risk evaluation.',
    ],
  },
  {
    role: 'Associate Trader',
    company: 'Maxitome Management Services',
    period: 'May 2024 — Nov 2024',
    summary:
      'F&O trading workflows with rule-based execution, backtesting, and live API-driven order management.',
    points: [
      'Backtested strategies and tracked performance across varying market conditions.',
      'Handled live market data, API-based execution, and portfolio monitoring under pressure.',
      'Refined rule-based systems through structured iteration and measurable outcomes.',
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
    venues: [
      {
        kind: 'Conference',
        name: 'ISTE-sponsored International Conference on Latest Trends in Science, Engineering, and Technology',
      },
    ],
    topics: ['Audio', 'Deep learning', 'Classification'],
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: 'Core Stack',
    items: ['Python', 'SQL', 'Pandas', 'NumPy', 'Scikit-learn', 'Git', 'Streamlit'],
  },
  {
    title: 'Machine Learning',
    items: [
      'Supervised Learning',
      'Unsupervised Learning',
      'Feature Engineering',
      'Model Evaluation',
      'NLP',
    ],
  },
  {
    title: 'Applied GenAI',
    items: [
      'LLM Workflows',
      'Prompt Engineering',
      'LangChain',
      'Embeddings',
      'Summarization',
    ],
  },
  {
    title: 'Markets & Analytics',
    items: ['F&O Workflows', 'Backtesting', 'Risk Awareness', 'Market Data Pipelines'],
  },
];

export const projects: Project[] = [
  {
    slug: 'bite-wise',
    title: 'BiteWise',
    eyebrow: 'Product · Swiggy Builders Club',
    year: '2026',
    role: 'Solo Builder',
    summary:
      'Approved Swiggy Builders Club project — a two-product food intelligence platform where NutriOrder AI powers nutrition-aware Swiggy ordering and SmartPantry AI handles household pantry, recipes, and grocery planning via Swiggy Food and Instamart MCP.',
    highlights: [
      'NutriOrder AI: health-profile-driven meal ranking across nutrition, cost, delivery time, taste, and availability — with explainable scores, cart review, and Food MCP order tracking.',
      'SmartPantry AI: shared household pantry, low-stock alerts, cook-today recipe matching, priority grocery lists, and Instamart cart preview through Instamart MCP.',
      'Swiggy Builders Club MCP stack with OAuth 2.1 PKCE, encrypted tokens, environment locks, and explicit confirmation before any Food or Instamart mutation.',
    ],
    stack: ['Next.js', 'FastAPI', 'Swiggy MCP', 'TypeScript', 'SQLAlchemy', 'Tailwind'],
    links: {
      live: 'https://bite-wise-theta.vercel.app',
      github: 'https://github.com/samadarsh/BiteWise',
    },
    cover: 'projects/bite-wise.webp',
    video: 'projects/bite-wise.mp4',
    architecture: [
      { label: 'Next.js app', detail: 'NutriOrder AI + SmartPantry AI interfaces' },
      { label: 'FastAPI backend', detail: 'Meal ranking, pantry and cart logic' },
      { label: 'OAuth 2.1 PKCE', detail: 'Per-user Swiggy auth, AES-256-GCM encrypted tokens' },
      { label: 'Swiggy MCP', detail: 'Food and Instamart, with explicit confirmation before any order' },
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
    stack: ['FastAPI', 'ChromaDB', 'PyMuPDF', 'LangChain', 'Streamlit', 'Ollama'],
    links: { live: null, github: 'https://github.com/samadarsh/fin-sight' },
    architecture: [
      { label: 'Financial PDFs', detail: 'Annual reports, transcripts, SEBI filings' },
      { label: 'PyMuPDF + LangChain', detail: 'Parsing and chunking' },
      { label: 'BGE embeddings', detail: 'Stored in persistent ChromaDB' },
      { label: 'Ollama or Gemini', detail: 'Grounded answers via FastAPI + Streamlit' },
      { label: 'Cited answer', detail: 'Inline [filename p.N] references' },
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
    architecture: [
      { label: 'Repository', detail: 'File-level analysis' },
      { label: 'Multi-stage LLM pipeline', detail: 'LangChain + Groq with bias control' },
      { label: 'Classification', detail: 'Project type and architecture summary' },
      { label: 'Structured JSON', detail: 'Exported from the Streamlit UI' },
    ],
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
    architecture: [
      { label: 'Mic or upload', detail: 'Browser capture, pydub chunking' },
      { label: 'Whisper-medium', detail: 'Tamil ASR (language=ta)' },
      { label: 'Custom romanizer', detail: 'Grapheme-level Tamil → Latin script' },
      { label: 'Readable text', detail: 'Gradio app on Hugging Face Spaces' },
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
    architecture: [
      { label: 'Job listing URL', detail: 'Scraped with LangChain WebBaseLoader' },
      { label: 'Llama 3.3 70B on Groq', detail: 'Structured requirement extraction' },
      { label: 'Portfolio match', detail: 'Relevant projects and links' },
      { label: 'Email draft', detail: 'Ready to send from Streamlit' },
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
