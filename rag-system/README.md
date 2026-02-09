# Production-Ready RAG System

A fully functional, enterprise-grade Retrieval-Augmented Generation (RAG) system for document-based question answering. Built with FastAPI, LangChain, FAISS, and OpenAI.

## 🎯 Overview

This RAG system enables users to upload private documents (PDF, TXT, DOCX) and ask questions with answers strictly grounded in the retrieved content. The system is designed to minimize hallucinations through careful prompt engineering and retrieval strategies.

**Key Features:**
- 📄 Multi-format document support (PDF, TXT, DOCX)
- 🔍 Semantic similarity search with FAISS
- 🤖 Hallucination-resistant prompt engineering
- 🚀 Production-ready FastAPI backend
- 💻 Clean Streamlit frontend
- 📊 Evaluation framework for quality assessment
- 🔒 Secure file handling and validation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Streamlit Frontend                           │
│              (Document Upload + Query Interface)                │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                           │
│  /upload-documents  │  /query  │  /health  │  /documents        │
└──────────┬─────────────────────────┬────────────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────────┐   ┌─────────────────────────────────────┐
│  Ingestion Pipeline  │   │     Retrieval & Generation          │
│  • Document Loader   │   │  • Query Embedding                  │
│  • Text Processor    │   │  • Vector Search (FAISS)            │
│  • Chunker (800 tok) │   │  • Prompt Construction              │
│  • Embedder          │   │  • LLM Generation (OpenAI)          │
└──────────────────────┘   └─────────────────────────────────────┘
           │                         │
           └────────────┬────────────┘
                        ▼
              ┌──────────────────────┐
              │   FAISS Vector DB    │
              │  (Embeddings + Meta) │
              └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- OpenAI API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd rag-system
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.template .env
   # Edit .env and add your OPENAI_API_KEY
   ```

### Running the System

1. **Start the FastAPI backend:**
   ```bash
   uvicorn src.api.main:app --reload
   ```
   API will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

2. **Start the Streamlit frontend (in a new terminal):**
   ```bash
   streamlit run frontend/streamlit_app.py
   ```
   UI will open at `http://localhost:8501`

## 📖 Usage

### Via Streamlit UI

1. **Upload Documents:**
   - Navigate to "Upload Documents" tab
   - Select PDF, TXT, or DOCX file (max 50 MB)
   - Click "Upload and Process"
   - Wait for processing to complete

2. **Ask Questions:**
   - Navigate to "Ask Questions" tab
   - Enter your question
   - Click "Ask"
   - View answer with source citations

### Via API

**Upload Document:**
```bash
curl -X POST "http://localhost:8000/api/v1/upload-documents" \
  -F "file=@document.pdf"
```

**Query Documents:**
```bash
curl -X POST "http://localhost:8000/api/v1/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main topic?",
    "top_k": 3,
    "include_sources": true
  }'
```

## 🔧 Configuration

Edit `.env` file to customize:

```env
# LLM Settings
LLM_MODEL=gpt-3.5-turbo
LLM_TEMPERATURE=0.1
LLM_MAX_TOKENS=1000

# Chunking (800 tokens balances context vs precision)
CHUNK_SIZE=800
CHUNK_OVERLAP=100

# Retrieval
TOP_K_RESULTS=3
SIMILARITY_THRESHOLD=0.7
```

## 📊 Technical Details

### Chunking Strategy

- **Chunk Size:** 800 tokens
- **Overlap:** 100 tokens
- **Rationale:** Provides sufficient context for semantic understanding while staying within LLM context windows. Overlap prevents information loss at boundaries.

### Prompt Engineering

The system uses a hallucination-resistant prompt that:
- Enforces strict context grounding
- Requires "I don't know" responses when information is missing
- Separates system and user prompts
- Includes source citation requirements

### Retrieval

- **Method:** Semantic similarity using FAISS IndexFlatL2
- **Top-k:** Configurable (default 3)
- **Score Thresholding:** Filters low-confidence matches
- **Metadata Filtering:** Optional filtering by source, page, etc.

## 🧪 Evaluation

The system includes an evaluation framework for assessing:

1. **Context Relevance:** Are retrieved chunks relevant to the query?
2. **Faithfulness:** Is the answer grounded in the context?
3. **Answer Relevance:** Does the answer address the question?
4. **Hallucination Detection:** Risk assessment for fabricated information

Run evaluation:
```python
from evaluation.evaluator import RAGEvaluator

evaluator = RAGEvaluator()
metrics = evaluator.evaluate_answer(question, answer, context)
print(f"Faithfulness: {metrics.faithfulness:.2f}")
print(f"Hallucination Risk: {metrics.hallucination_risk:.2f}")
```

## 🏭 Production Considerations

### Cost Optimization
- Cache embeddings to avoid re-computation
- Use smaller models for non-critical use cases
- Batch LLM requests where possible
- Monitor token usage with built-in tracking

### Security
- Input sanitization prevents path traversal
- File type and size validation
- API key stored in environment variables
- CORS configuration for frontend access

### Scaling
- **Current:** Local FAISS (suitable for <100K documents)
- **Scale Up:** Migrate to Pinecone, Weaviate, or Qdrant
- **API:** Horizontal scaling with load balancer
- **Async:** Document processing can be moved to background workers

### Monitoring
- Built-in logging with Loguru
- Health check endpoint (`/health`)
- Token usage tracking
- Query metrics collection

## 📁 Project Structure

```
rag-system/
├── config/
│   └── settings.py           # Configuration management
├── src/
│   ├── ingestion/            # Document processing
│   │   ├── document_loader.py
│   │   ├── text_processor.py
│   │   ├── chunker.py
│   │   └── embedder.py
│   ├── retrieval/            # Vector search
│   │   ├── vector_store.py
│   │   └── retriever.py
│   ├── generation/           # LLM integration
│   │   ├── llm_client.py
│   │   └── prompt_templates.py
│   ├── api/                  # FastAPI backend
│   │   ├── main.py
│   │   ├── routes.py
│   │   └── models.py
│   └── utils/                # Utilities
│       ├── logger.py
│       └── validators.py
├── frontend/
│   └── streamlit_app.py      # Streamlit UI
├── evaluation/               # Quality assessment
│   ├── evaluator.py
│   └── metrics.py
├── data/
│   ├── uploads/              # Uploaded documents
│   └── vector_store/         # FAISS indices
├── requirements.txt
├── .env.template
└── README.md
```

## 🐛 Troubleshooting

**API not starting:**
- Check if port 8000 is available
- Verify `.env` file exists with valid `OPENAI_API_KEY`

**Document upload fails:**
- Check file size (max 50 MB)
- Verify file format (PDF, TXT, DOCX only)
- Check logs in `logs/rag_system.log`

**Empty responses:**
- Ensure documents are uploaded first
- Check similarity threshold (lower if too strict)
- Verify OpenAI API key is valid

## 📝 Resume-Ready Description

**Production RAG System | Python, FastAPI, LangChain, FAISS**

Architected and implemented enterprise-grade Retrieval-Augmented Generation system supporting multi-format document ingestion (PDF, DOCX, TXT). Engineered semantic chunking strategy with 800-token windows and 100-token overlap, optimizing retrieval precision while maintaining context. Designed hallucination-resistant prompt templates reducing false information generation by enforcing strict context grounding. Built RESTful API with FastAPI featuring document upload, query endpoints, and comprehensive error handling. Implemented FAISS vector database with metadata filtering for efficient similarity search. Created Streamlit-based UI with source attribution and confidence scoring for transparent AI responses. Established evaluation framework measuring context relevance, faithfulness, and answer quality.

## 🤝 Contributing

This is a portfolio project demonstrating production-ready RAG implementation. Feel free to use as reference for your own projects.

## 📄 License

MIT License - feel free to use for learning and portfolio purposes.

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern web framework
- [LangChain](https://langchain.com/) - LLM orchestration
- [FAISS](https://github.com/facebookresearch/faiss) - Vector similarity search
- [OpenAI](https://openai.com/) - LLM and embeddings
- [Streamlit](https://streamlit.io/) - Frontend framework
