// Facts from Adarsh's resume that the site doesn't show elsewhere. Used by the "Ask Adarsh"
// assistant (see src/lib/knowledge.ts); keep this in sync with the resume.

export const resumeOnly = {
  schooling: [
    'HSC (2019–2020) and SSLC (2017–2018), Don Bosco Matriculation Higher Secondary School, Peravallur, Chennai.',
  ],
  neeromaExtra:
    'Yantra is a multi-agent AI software factory. Beyond the L5 Deploy and L6 Tickets agents he enhanced Agent Studio, observability, UI workflows and regression testing. QLearn AI Classroom covers AI tutoring, contextual Q&A, LLM content generation and adaptive learning.',
  openSource: [
    'OpenClaw: fixed the macOS VM installation guide to provision Node.js before OpenClaw, resolving installation failures on fresh VMs; improved the guide’s Gateway setup and host-browser dashboard access using SSH tunnelling and the dashboard pairing flow.',
    'OpenAlgo: fixed WebSocket market-data timestamps for Upstox and Zerodha so exchange trade time is exposed correctly across quote and depth feeds; resolved a master-contract race condition during concurrent login/download operations and added regression tests.',
  ],
  certifications: [
    'Google Data Analytics (Coursera)',
    'Python Masterclass (Udemy)',
    'Mastering Model Context Protocol (LinkedIn Learning)',
    'Advanced Data Science (SkillsPire Technologies)',
    'Cybersecurity Infrastructure Configuration (Palo Alto Networks)',
  ],
  achievements: [
    'Selected member of the Swiggy Builders Club (2026, after graduating; BiteWise is the approved project).',
    'Event Management Head, Student Council of the Artificial Intelligence & Data Science Department, Easwari Engineering College (2023–2024, during the B.Tech).',
  ],
  skills: {
    'Machine Learning & Generative AI': [
      'Agentic AI & multi-agent systems',
      'Retrieval-augmented generation (RAG)',
      'LLMs & prompt engineering',
      'NLP',
      'Supervised & unsupervised learning',
    ],
    'Programming, frameworks & tools': [
      'Python (NumPy, Pandas, scikit-learn)',
      'LangChain & LangGraph',
      'Hugging Face Transformers',
      'TensorFlow & PyTorch',
      'FastAPI, Flask & Streamlit',
      'SQL',
      'Git & GitHub',
      'TypeScript, React, Node.js, Express, MongoDB (used at Neeroma and Bae AI)',
    ],
    'LLM & AI tools': [
      'OpenAI API, Groq, Gemini & Ollama',
      'FAISS, Pinecone, Chroma & Weaviate',
      'MCP & tool calling',
      'LLM inference & streaming',
      'RAG pipelines & vector search',
    ],
  },
};
