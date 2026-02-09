# RAG System Architecture

## System Overview

The RAG (Retrieval-Augmented Generation) system is designed as a production-ready application for document-based question answering. It follows a modular architecture with clear separation of concerns.

## Core Components

### 1. Document Ingestion Pipeline

**Purpose:** Process uploaded documents into searchable chunks with embeddings.

**Flow:**
1. **Document Loader** (`src/ingestion/document_loader.py`)
   - Supports PDF (pdfplumber + PyPDF2 fallback), TXT, DOCX
   - Extracts text with page-level metadata
   - Handles corrupted files gracefully

2. **Text Processor** (`src/ingestion/text_processor.py`)
   - Unicode normalization
   - Whitespace cleanup
   - Line break fixing (common in PDFs)
   - Special character handling

3. **Chunker** (`src/ingestion/chunker.py`)
   - Recursive character splitting via LangChain
   - 800 tokens per chunk (configurable)
   - 100 token overlap
   - Preserves metadata (source, page, chunk_id)

4. **Embedder** (`src/ingestion/embedder.py`)
   - OpenAI embeddings (text-embedding-3-small)
   - Hugging Face fallback (all-MiniLM-L6-v2)
   - Batch processing for efficiency
   - Caching to avoid re-embedding

**Design Decisions:**
- **800-token chunks:** Balances semantic completeness with retrieval precision
- **100-token overlap:** Prevents context loss at chunk boundaries
- **Recursive splitting:** Preserves semantic units (paragraphs → sentences → words)

### 2. Vector Storage & Retrieval

**Purpose:** Efficient similarity search over document embeddings.

**Components:**

1. **FAISS Vector Store** (`src/retrieval/vector_store.py`)
   - IndexFlatL2 for exact L2 distance search
   - Metadata storage alongside vectors
   - Persistent storage (save/load from disk)
   - Document tracking for deletion

2. **Retriever** (`src/retrieval/retriever.py`)
   - Semantic similarity search
   - Top-k retrieval (configurable)
   - Score thresholding (filters low-confidence matches)
   - Metadata filtering (by source, page, etc.)
   - Context formatting for LLM

**Design Decisions:**
- **FAISS IndexFlatL2:** Exact search for accuracy (vs approximate methods)
- **Local-first:** Simple deployment, suitable for <100K documents
- **Metadata filtering:** Enables source-specific queries

**Scaling Path:**
- Current: FAISS (local, <100K docs)
- Medium: FAISS with IVF index (100K-1M docs)
- Large: Pinecone/Weaviate/Qdrant (distributed, >1M docs)

### 3. LLM Integration & Prompt Engineering

**Purpose:** Generate grounded answers from retrieved context.

**Components:**

1. **Prompt Templates** (`src/generation/prompt_templates.py`)
   - System prompt enforcing context grounding
   - User prompt with context and question
   - "I don't know" fallback requirement
   - Source citation instructions

2. **LLM Client** (`src/generation/llm_client.py`)
   - OpenAI API integration (GPT-3.5/GPT-4)
   - Local model support via Ollama
   - Retry logic with exponential backoff
   - Token counting and cost tracking
   - Response validation

**Design Decisions:**
- **Temperature 0.1:** Deterministic, factual responses
- **System/User separation:** Clear role vs task distinction
- **Explicit constraints:** Reduces hallucination risk

**Hallucination Prevention:**
1. Strict system prompt ("ONLY use provided context")
2. "I don't know" requirement for missing information
3. Source citation enforcement
4. Low temperature (0.1) for factual responses
5. Response validation (checks for uncertainty expressions)

### 4. API Layer (FastAPI)

**Purpose:** RESTful interface for document management and querying.

**Endpoints:**

1. **POST /upload-documents**
   - Accepts file upload
   - Validates type and size
   - Processes through ingestion pipeline
   - Returns document ID and chunk count

2. **POST /query**
   - Accepts question and parameters
   - Retrieves relevant chunks
   - Generates answer via LLM
   - Returns answer with source citations

3. **GET /health**
   - System health check
   - Vector store statistics
   - LLM usage statistics

4. **GET /documents**
   - Lists uploaded documents
   - Shows chunk counts

5. **DELETE /documents/{doc_id}**
   - Removes document from vector store
   - Deletes file from disk

**Design Decisions:**
- **Pydantic models:** Request/response validation
- **Exception handlers:** Graceful error responses
- **CORS middleware:** Frontend access
- **Request logging:** Debugging and monitoring

### 5. Frontend (Streamlit)

**Purpose:** User-friendly interface for document upload and querying.

**Features:**
- Document upload with progress indication
- Query interface with source citations
- Document management (list, delete)
- Settings (top_k configuration)
- Error handling and user feedback

**Design Decisions:**
- **Streamlit:** Rapid development, clean UI
- **Tabbed interface:** Separate upload and query workflows
- **Source expandables:** Detailed citation information
- **Disclaimer:** Sets user expectations

## Data Flow

### Document Upload Flow

```
User uploads file
    ↓
FastAPI validates file (type, size)
    ↓
DocumentLoader extracts text
    ↓
TextProcessor cleans text
    ↓
Chunker splits into 800-token chunks
    ↓
Embedder generates vectors
    ↓
VectorStore saves embeddings + metadata
    ↓
Response returned to user
```

### Query Flow

```
User asks question
    ↓
FastAPI receives query
    ↓
Embedder creates query vector
    ↓
VectorStore searches for top-k similar chunks
    ↓
Retriever formats context
    ↓
PromptTemplate constructs LLM prompt
    ↓
LLMClient generates answer
    ↓
Response with sources returned to user
```

## Configuration Management

**Settings** (`config/settings.py`):
- Pydantic-based configuration
- Environment variable loading
- Validation and type checking
- Automatic directory creation

**Key Parameters:**
- `CHUNK_SIZE`: 800 tokens
- `CHUNK_OVERLAP`: 100 tokens
- `TOP_K_RESULTS`: 3 chunks
- `SIMILARITY_THRESHOLD`: 0.7
- `LLM_TEMPERATURE`: 0.1

## Error Handling Strategy

1. **Validation Errors:** Return 422 with details
2. **Not Found:** Return 404 with message
3. **Processing Errors:** Return 500 with sanitized error
4. **Logging:** All errors logged with context
5. **User Feedback:** Clear, actionable error messages

## Security Considerations

1. **Input Validation:**
   - File type whitelist (PDF, TXT, DOCX)
   - File size limit (50 MB)
   - Filename sanitization (prevent path traversal)

2. **API Security:**
   - CORS configuration
   - Request validation (Pydantic)
   - Error message sanitization

3. **Secrets Management:**
   - API keys in environment variables
   - .env file excluded from git
   - .env.template for documentation

## Performance Optimizations

1. **Embedding Caching:** Avoid re-embedding identical text
2. **Batch Processing:** Embed multiple chunks together
3. **Async Operations:** Non-blocking file I/O
4. **Connection Pooling:** Reuse HTTP connections
5. **Index Persistence:** Avoid rebuilding FAISS index

## Monitoring & Observability

1. **Logging:**
   - Structured logging with Loguru
   - File and console outputs
   - Request/response logging

2. **Metrics:**
   - Token usage tracking
   - Query response times
   - Retrieval quality scores

3. **Health Checks:**
   - Vector store status
   - LLM connectivity
   - System statistics

## Future Enhancements

1. **Hybrid Search:** Combine semantic + keyword search
2. **Re-ranking:** Improve retrieval with cross-encoder
3. **Conversation Memory:** Multi-turn dialogue support
4. **Advanced Chunking:** Semantic chunking with sentence embeddings
5. **Distributed Storage:** Migration to Pinecone/Weaviate
6. **Authentication:** User management and access control
7. **Rate Limiting:** Prevent abuse
8. **Caching Layer:** Redis for frequent queries
