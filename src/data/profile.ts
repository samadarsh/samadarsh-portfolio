// Facts about Adarsh that the site doesn't show elsewhere, used only by the "Ask Ash"
// assistant (see src/lib/knowledge.ts). Sources: his resume and his own knowledge-profile notes.
// Where those notes disagreed with the site (dates, project details), the site wins.
// Keep everything here factual and public-safe: no internal company metrics or client details.

export const story =
  'He started with an interest in software and data, which led him to a B.Tech in Artificial Intelligence and Data Science. Over time he moved from traditional machine learning into deep learning, NLP, LLMs, RAG and AI agents. His experience in trading and financial markets gave him another area to apply AI, particularly automation and decision-support systems. Today his main focus is building practical AI systems that interact with real software, data and workflows rather than only generating text.';

export const strengths = [
  'Problem solving: he investigates the actual root cause rather than patching the visible symptom.',
  'Fast technical learning: he has moved across ML, GenAI, RAG, agents, full-stack development and financial APIs.',
  'Building practical systems: he prefers turning AI concepts into working applications and workflows.',
];

export const proudOf = [
  'Working on real AI products (Yantra and QLearn at Neeroma) where AI interacts with software-engineering and education workflows, beyond academic ML projects.',
  'His agent work on Yantra, especially the L5 Deploy Agent and L6 Tickets Agent, and the engineering challenges of multi-agent applications.',
  'His open-source contributions to OpenClaw and OpenAlgo.',
  'Combining AI engineering with hands-on financial-markets experience, an unusual mix of technical and domain knowledge.',
];

export const interests = [
  'Artificial intelligence and AI agents',
  'Open-source software',
  'Financial markets and algorithmic trading',
  'Building software projects',
];

/** Extra detail per employer, keyed by the company name used on the site. */
export const roleDetails: Record<string, string[]> = {
  'Neeroma Technologies': [
    'He works mainly on Yantra, a multi-agent AI software factory, and QLearn, an AI-powered classroom/education platform.',
    'How Yantra works: instead of one general agent doing everything, specialised agents own each stage of the software lifecycle. L1 Design Agent handles design and planning; L2–L4 Development Agents build the software; L5 Deploy Agent handles deployment workflows; L6 Tickets Agent handles support tickets, triage, resolution and engineering hand-offs; L7 Marketing Agent handles marketing workflows.',
    'His Yantra work spans the L5 Deploy, L6 Tickets and L7 Marketing agents, Agent Studio, agent workflow and chat infrastructure, SSE chat streaming, frontend and backend debugging, permission and access-control fixes, ticketing and deployment workflows, UI/UX and tab-level audits, and regression testing with type and lint validation.',
    'He works directly on production-oriented code using Claude Code in the browser: investigating issues, implementing fixes, running tests and preparing changes for review and merge.',
    'L5 Deploy Agent: he worked extensively on its workflows, UI, deployment functionality, tab architecture, observability and regressions. He ran a systematic real-browser audit of the Deploy Agent’s tabs across its stages and fixed issues such as incorrect tab queries, tabs rendering empty, observability-panel issues, stage-card positioning, duplicate Runbooks entries, Core/Advanced tab separation, guide-entry inconsistencies and drift-guard issues. The audit also substantially reduced the overloaded production tab strip.',
    'L6 Tickets Agent: he audited and implemented changes around ticketing access control, server-side feature gates, ticket submission and resolution, SLA policies, the support widget, Human Board workflows, agent hand-off, documentation lookup and ticketing chat. He found that parts of the ticketing system had evolved along separate paths (different SLA logic and legacy submission routes), and moved the Tickets Agent chat onto the same progressive SSE streaming architecture the Development Agent uses.',
    'QLearn: he investigated application issues, implemented feature fixes, debugged UI behaviour, worked on AI classroom functionality (AI tutoring and AI-assisted learning), investigated configuration-related crashes, and supported the team in preparing product demos.',
  ],
  'Bae AI': [
    'He built BAExt, an AI-powered intent engine for product/catalog search: it converts natural-language product requests into structured intent and ranks matching products.',
    'Technical work: a MERN/TypeScript implementation covering natural-language intent parsing, product matching, an 11-signal ranking system, validation, fallback policies, Docker-based execution, automated tests and stress testing, on a mock catalog of about 1,200 SKUs, with 250+ automated tests and 300-query stress testing.',
    'Hardest problem: making product matching deterministic and reliable instead of relying on an LLM to produce the answer. The system combines parsing, structured signals, validation and ranking so the same intent always produces predictable product selection.',
  ],
  'Angel One': [
    'He worked with clients in the equity and derivatives markets: client onboarding and KYC, resolving trading-platform issues, understanding client requirements, market and time-series analysis, portfolio and trading assistance, setting up automated trading workflows with Angel One APIs, and maintaining structured client records.',
    'He also worked with algorithmic-trading infrastructure, including OpenAlgo.',
  ],
  'Maxitome Management Services': [
    'His work involved market analysis, trading, monitoring market movements, studying price action, working with trading strategies and supporting trading operations. It gave him a practical understanding of financial markets, which later fed his interest in combining AI/ML with trading and financial technology.',
  ],
  'Sona Comstar': [
    'His work focused on developing and improving machine-learning pipelines: data preprocessing, feature engineering, outlier handling, cross-validation, hyperparameter tuning, predictive ML pipelines and model evaluation.',
  ],
};

/** Extra context per project, keyed by project slug. */
export const projectDetails: Record<string, string[]> = {
  'bite-wise': [
    'Independent project, accepted into the Swiggy Builders Club, which validated its direction and integration approach.',
    'Why he built it: to bring food discovery, ordering, AI assistance and nutritional awareness together instead of treating ordering and nutrition as separate experiences.',
    'What makes it technically interesting: it explores how an AI agent can act on real food-ordering infrastructure (the official Swiggy MCP APIs) rather than only generating text.',
  ],
  'fin-sight': [
    'The idea: ground answers about financial documents in retrieved source text instead of the model’s internal knowledge.',
  ],
  repomind: [
    'The goal is to let an AI system reason about a codebase as a whole rather than treating source files independently. It relates closely to his current work on AI software-engineering agents such as Yantra.',
  ],
  'genai-email': [
    'The goal was to make outreach email writing easier through a simple AI-powered interface.',
  ],
};

export const finalYearProject =
  'Final-year B.Tech project: Real-time Nutritional Guidance using YOLOv6, which uses computer vision to identify food and provide nutritional guidance. His food-recognition research publication comes from the same area.';

export const marketsBackground =
  'His interest in financial markets developed alongside his AI/ML background. He worked as an Associate Trader at Maxitome, then as an Authorised Person with Angel One, gaining practical exposure to equity markets, derivatives, technical analysis, trading systems, market data and algorithmic trading. His AI background led him to explore how machine learning and automation apply to financial workflows.';

export const haugtunAbout =
  'Haugtun is his market and trading initiative, aimed at people interested in financial markets, trading, market analysis, trading technology and automated trading. He uses it to share market and trading content.';

export const schooling = [
  'HSC (2019–2020) and SSLC (2017–2018), Don Bosco Matriculation Higher Secondary School, Peravallur, Chennai.',
];

export const openSource = [
  'OpenClaw (contributor, not maintainer): fixed the macOS VM installation guide to provision Node.js before OpenClaw, resolving installation failures on fresh VMs; improved the guide’s Gateway setup and host-browser dashboard access using SSH tunnelling and the dashboard pairing flow. PRs #160239 and #162736.',
  'OpenAlgo (contributor, not maintainer): fixed WebSocket market-data timestamps for Upstox and Zerodha so exchange trade time is exposed correctly across quote and depth feeds; resolved a master-contract race condition during concurrent login/download operations; added regression tests. PRs #2170, #2133 and #2119.',
];

export const certifications = [
  'Google Data Analytics (Coursera)',
  'Python Masterclass (Udemy)',
  'Mastering Model Context Protocol (LinkedIn Learning)',
  'Advanced Data Science (SkillsPire Technologies)',
  'Cybersecurity Infrastructure Configuration (Palo Alto Networks)',
];

export const achievements = [
  'Selected member of the Swiggy Builders Club (2026, after graduating; BiteWise is the approved project).',
  'Event Management Head, Student Council of the Artificial Intelligence & Data Science Department, Easwari Engineering College (2023–2024, during the B.Tech).',
];

export const skills: Record<string, string[]> = {
  'AI / ML': [
    'Python, NumPy, Pandas, scikit-learn',
    'TensorFlow, Keras, PyTorch',
    'Hugging Face Transformers',
    'Deep learning, NLP, computer vision',
    'Supervised and unsupervised learning',
  ],
  'Generative AI': [
    'LLMs, prompt engineering, RAG',
    'LangChain and LangGraph',
    'MCP and tool calling',
    'AI agents and multi-agent systems',
    'OpenAI API, Groq, Llama, Gemini, Ollama',
    'LLM inference and streaming',
  ],
  'Vector search': ['Pinecone, FAISS, Chroma, Weaviate'],
  Development: [
    'TypeScript, JavaScript, React, Node.js, Express, MongoDB (MERN; used at Neeroma and Bae AI)',
    'FastAPI, Flask, Streamlit',
    'SQL, Docker, Git and GitHub',
  ],
  'Data and analytics': ['Excel, Power BI, Pandas, NumPy'],
  'Financial technology': [
    'Angel One API, OpenAlgo, broker APIs',
    'Algorithmic trading, market and time-series analysis',
  ],
};
