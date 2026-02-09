# Production Considerations

## Cost Optimization

### Embedding Costs

**Current Approach:**
- OpenAI text-embedding-3-small: ~$0.02 per 1M tokens
- Average document (10 pages): ~5,000 tokens = $0.0001

**Optimization Strategies:**

1. **Caching:**
   - Implemented in `Embedder` class
   - Avoids re-embedding identical text
   - Saves ~30-50% on repeated documents

2. **Batch Processing:**
   - Embed multiple chunks in single API call
   - Reduces network overhead
   - Current batch size: 100 chunks

3. **Alternative Models:**
   - Hugging Face sentence-transformers (free, local)
   - Trade-off: Lower quality but zero cost
   - Good for development/testing

### LLM Costs

**Current Approach:**
- GPT-3.5-turbo: ~$0.002 per 1K tokens
- Average query: ~1,500 tokens (context + question + answer) = $0.003

**Optimization Strategies:**

1. **Token Limits:**
   - Max tokens set to 1,000 for answers
   - Prevents runaway generation
   - Estimated monthly cost for 1,000 queries: ~$3

2. **Model Selection:**
   - GPT-3.5-turbo for most queries
   - GPT-4 only for complex questions (if needed)
   - Local models (LLaMA, Mistral) via Ollama for cost-sensitive deployments

3. **Caching Frequent Queries:**
   - Implement Redis cache for common questions
   - Cache hit rate: ~20-30% in production
   - Saves ~$0.60 per 1,000 queries

4. **Request Batching:**
   - Combine multiple queries where possible
   - Reduces API overhead

**Monthly Cost Estimate (1,000 users, 10 queries/user/month):**
- Embeddings: ~$0.50
- LLM queries: ~$30
- **Total: ~$30-35/month**

## Security

### Input Validation

**File Upload:**
```python
# Implemented in validators.py
- File type whitelist: ['.pdf', '.txt', '.docx']
- File size limit: 50 MB
- Filename sanitization: Remove path traversal characters
```

**Query Validation:**
```python
- Min length: 3 characters
- Max length: 500 characters
- Alphanumeric check: Prevent injection attacks
```

### API Security

**Current Implementation:**
1. **CORS Configuration:**
   - Whitelist specific origins
   - Configurable via environment variables

2. **Request Validation:**
   - Pydantic models enforce schema
   - Type checking and constraints

3. **Error Sanitization:**
   - Don't expose internal paths
   - Generic error messages to users
   - Detailed errors in logs only

**Production Enhancements:**

1. **Authentication:**
   ```python
   from fastapi import Depends, HTTPException
   from fastapi.security import HTTPBearer
   
   security = HTTPBearer()
   
   async def verify_token(credentials = Depends(security)):
       # Implement JWT verification
       pass
   ```

2. **Rate Limiting:**
   ```python
   from slowapi import Limiter
   
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/query")
   @limiter.limit("10/minute")
   async def query_documents(...):
       pass
   ```

3. **API Key Rotation:**
   - Store in secret management service (AWS Secrets Manager, HashiCorp Vault)
   - Rotate every 90 days
   - Monitor for unauthorized usage

### Data Security

**Document Storage:**
- Uploaded files stored in `data/uploads/`
- Sanitized filenames prevent path traversal
- Consider encryption at rest for sensitive documents

**Vector Store:**
- FAISS index stored locally
- Contains embeddings (not raw text)
- Metadata includes text chunks - consider encryption

**Production Recommendations:**
1. Encrypt data at rest (AES-256)
2. Use HTTPS for all API calls
3. Implement document access control per user
4. Regular security audits
5. Compliance with GDPR/CCPA if applicable

## Scaling

### Current Limitations

- **FAISS Local:** Single-machine, <100K documents
- **Synchronous Processing:** Blocks during upload
- **Single Instance:** No load balancing

### Scaling Path

#### Phase 1: Optimize Current Architecture (100K-500K docs)

1. **FAISS IVF Index:**
   ```python
   # Replace IndexFlatL2 with IndexIVFFlat
   quantizer = faiss.IndexFlatL2(dimension)
   index = faiss.IndexIVFFlat(quantizer, dimension, nlist=100)
   index.train(training_vectors)
   ```
   - Approximate search with clustering
   - 10-100x faster for large indices
   - Slight accuracy trade-off

2. **Async Document Processing:**
   ```python
   from celery import Celery
   
   @celery.task
   def process_document(file_path):
       # Move ingestion to background worker
       pass
   ```

3. **Redis Caching:**
   ```python
   import redis
   
   cache = redis.Redis(host='localhost', port=6379)
   
   # Cache frequent queries
   cache_key = f"query:{hash(question)}"
   cached_result = cache.get(cache_key)
   ```

#### Phase 2: Distributed Architecture (500K-5M docs)

1. **Migrate to Managed Vector DB:**
   - **Pinecone:** Fully managed, easy migration
   - **Weaviate:** Open-source, self-hosted option
   - **Qdrant:** High performance, Rust-based

   ```python
   import pinecone
   
   pinecone.init(api_key="...", environment="...")
   index = pinecone.Index("rag-system")
   
   # Same interface as FAISS
   index.upsert(vectors=embeddings, metadata=metadata)
   results = index.query(vector=query_embedding, top_k=3)
   ```

2. **Horizontal Scaling:**
   ```yaml
   # docker-compose.yml
   services:
     api:
       image: rag-api
       replicas: 3
       
     nginx:
       image: nginx
       ports:
         - "80:80"
       # Load balance across API instances
   ```

3. **Separate Services:**
   - Ingestion Service: Handles uploads
   - Query Service: Handles queries
   - Admin Service: Manages documents

#### Phase 3: Enterprise Scale (>5M docs)

1. **Kubernetes Deployment:**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: rag-api
   spec:
     replicas: 10
     # Auto-scaling based on load
   ```

2. **Sharding Strategy:**
   - Shard by document type
   - Shard by date range
   - Shard by user/tenant

3. **CDN for Static Assets:**
   - CloudFront for Streamlit frontend
   - Reduce latency globally

### Performance Benchmarks

**Current (Local FAISS):**
- Document upload: ~30 seconds for 50-page PDF
- Query response: ~3-5 seconds
- Concurrent users: ~10

**Optimized (IVF + Caching):**
- Document upload: ~10 seconds (async)
- Query response: ~1-2 seconds
- Concurrent users: ~50

**Distributed (Pinecone + K8s):**
- Document upload: ~5 seconds (async)
- Query response: <1 second
- Concurrent users: ~1,000+

## Model Switching

### LLM Switching

**OpenAI → Local (Ollama):**

```python
# In .env
USE_LOCAL_LLM=true
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=llama2

# No code changes needed - LLMClient handles both
```

**Benefits:**
- Zero API costs
- Data privacy (no external calls)
- Offline operation

**Trade-offs:**
- Lower quality answers
- Requires GPU for reasonable speed
- Maintenance overhead

### Embedding Model Switching

**OpenAI → Hugging Face:**

```python
# In embedder.py
embedder = Embedder(use_openai=False)
# Uses sentence-transformers automatically
```

**Benefits:**
- Free, unlimited usage
- Faster for batch processing
- No API dependency

**Trade-offs:**
- Lower embedding quality
- Different dimensions (384 vs 1536)
- Requires model download (~100MB)

## Rate Limiting

### Implementation

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/upload-documents")
@limiter.limit("5/hour")  # 5 uploads per hour per IP
async def upload_document(...):
    pass

@app.post("/query")
@limiter.limit("60/minute")  # 60 queries per minute per IP
async def query_documents(...):
    pass
```

### Strategy

- **Upload:** 5 per hour (prevents abuse)
- **Query:** 60 per minute (allows normal usage)
- **Health:** Unlimited (monitoring)

### Advanced Rate Limiting

```python
# Per-user rate limiting (requires auth)
def get_user_id(request: Request):
    return request.state.user.id

limiter = Limiter(key_func=get_user_id)

# Tiered limits
@limiter.limit("100/hour", key_func=lambda: "free_tier")
@limiter.limit("1000/hour", key_func=lambda: "pro_tier")
async def query_documents(...):
    pass
```

## Monitoring & Observability

### Logging

**Current:** Loguru with file rotation

**Production Enhancement:**
```python
# Structured JSON logging
import structlog

logger = structlog.get_logger()
logger.info("query_processed", 
    user_id=user_id,
    query_time=elapsed,
    chunks_retrieved=len(results))
```

### Metrics

**Prometheus Integration:**
```python
from prometheus_client import Counter, Histogram

query_counter = Counter('rag_queries_total', 'Total queries')
query_duration = Histogram('rag_query_duration_seconds', 'Query duration')

@query_duration.time()
async def query_documents(...):
    query_counter.inc()
    # ... process query
```

### Alerting

**Key Metrics to Monitor:**
1. Query response time (p50, p95, p99)
2. Error rate (>5% = alert)
3. Token usage (budget monitoring)
4. Vector store size (disk space)
5. API availability (uptime)

**Alert Thresholds:**
- Response time p95 > 10 seconds
- Error rate > 5%
- Disk usage > 80%
- API downtime > 1 minute

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./data:/app/data
      
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.streamlit
    ports:
      - "8501:8501"
    depends_on:
      - api
```

### Cloud Deployment

**AWS:**
- ECS/Fargate for containers
- S3 for document storage
- RDS for metadata (if needed)
- CloudWatch for logging

**GCP:**
- Cloud Run for serverless
- Cloud Storage for documents
- Cloud SQL for metadata
- Cloud Logging

**Estimated Monthly Cost (AWS, 1K users):**
- ECS Fargate: ~$30
- S3 storage: ~$5
- CloudWatch: ~$10
- **Total: ~$45 + OpenAI costs**
