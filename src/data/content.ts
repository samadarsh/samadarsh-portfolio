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
  pageName: string;
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

export type SkillGroup = {
  title: string;
  items: string[];
};

export const heroContent = {
  eyebrow: 'AI · Systems · Capital',
  name: 'Adarsh S',
  tagline:
    'Building AI and data systems for real-world products and financial markets.',
  location: 'Chennai, India',
  available: true,
};

export const stats = [
  { value: '7+', label: 'Shipped AI, data & client projects' },
  { value: '8.23', label: 'B.Tech CGPA · AI / DS' },
  { value: '3+', label: 'Years across markets & data' },
  { value: '∞', label: 'Curiosity about systems' },
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
      'Led the architecture and development of the AI Classroom module for QLearn, building an intelligent learning environment that combines AI tutoring, adaptive learning, contextual content delivery, and interactive educational experiences.',
    points: [
      'Developed AI-powered learning workflows and educational features by integrating LLM capabilities, intelligent content generation, adaptive practice systems, and real-time user interactions across the platform.',
      'Built scalable full-stack applications using React, TypeScript, Node.js, Express.js, MongoDB, Tailwind CSS, and AI technologies, focusing on modular architecture, high performance, and enterprise-grade security.',
      'Provided technical leadership throughout the development lifecycle by coordinating implementation efforts, reviewing solutions, resolving complex technical issues, and ensuring high-quality engineering standards across the QLearn modules.',
    ],
  },
  {
    role: 'AI/ML Intern',
    company: 'Bae AI',
    period: 'May 2026 — Jun 2026',
    summary:
      'Built the BAExt Intent Engine — a deterministic pipeline that turns shopping queries into structured intent, ranked product blocks, and validated JSON across a 1,200-SKU catalog.',
    points: [
      'Implemented the full MERN stack (Node/Express, React, MongoDB, TypeScript) across query parsing, 11-signal ranking, answer generation, and end-to-end orchestration.',
      'Delivered production hardening with query caching, Docker Compose, and 250+ automated tests.',
      'Ran 300-query stress testing with output grounding and performance benchmarks.',
    ],
  },
  {
    role: 'Authorised Person',
    company: 'Angel One',
    period: 'Jan 2025 — Present',
    kind: 'Proprietorship',
    summary:
      'Independent proprietorship in equities and derivatives — a research-driven practice that sharpens the same analytical instincts I bring to AI and data systems.',
    points: [
      'Built a structured market research workflow rooted in data-driven decisions and risk awareness.',
      'Live exposure to time-sensitive data, execution, and portfolio monitoring under real conditions.',
      'A complementary practice that strengthens the analytical and operational depth I bring to AI work.',
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
    stack: ['React', 'React Router', 'Vite', 'Vanilla CSS', 'Schema.org', 'Vercel'],
    links: { live: 'https://bluemoon-studio-tawny.vercel.app', github: null },
    cover: 'projects/bluemoon-studio.webp',
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
    accent: 'from-zinc-700 via-zinc-800 to-zinc-900',
  },
];

export const writingMeta: WritingMeta = {
  pageName: 'Haugtun',
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

export const socialLinks = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/samadarsh14' },
  { label: 'GitHub', href: 'https://github.com/samadarsh' },
  { label: 'Email', href: 'mailto:samadarsh14@gmail.com' },
] as const;
