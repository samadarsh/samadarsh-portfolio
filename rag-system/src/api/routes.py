"""
API routes for the RAG system.
Implements document upload, query, and management endpoints.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pathlib import Path
import shutil
from datetime import datetime
from typing import Dict

from src.api.models import (
    UploadResponse, QueryRequest, QueryResponse, ErrorResponse,
    HealthResponse, DocumentListResponse, DeleteDocumentResponse,
    SourceCitation, DocumentInfo
)
from src.ingestion.document_loader import DocumentLoader
from src.ingestion.text_processor import TextProcessor
from src.ingestion.chunker import DocumentChunker
from src.ingestion.embedder import Embedder
from src.retrieval.vector_store import FAISSVectorStore
from src.retrieval.retriever import Retriever
from src.generation.llm_client import LLMClient
from src.generation.prompt_templates import create_rag_prompt_with_sources
from src.utils.validators import validate_file_extension, validate_file_size, sanitize_filename
from src.utils.logger import get_logger
from config.settings import settings

logger = get_logger()
router = APIRouter()

# Global instances (initialized in main.py)
vector_store: FAISSVectorStore = None
embedder: Embedder = None
retriever: Retriever = None
llm_client: LLMClient = None
document_loader: DocumentLoader = None
text_processor: TextProcessor = None
chunker: DocumentChunker = None

# Document metadata tracking
document_metadata: Dict[str, Dict] = {}


def initialize_components():
    """Initialize all RAG components."""
    global vector_store, embedder, retriever, llm_client
    global document_loader, text_processor, chunker
    
    logger.info("Initializing RAG components...")
    
    # Initialize embedder
    embedder = Embedder(use_openai=True)
    
    # Initialize vector store and load existing index
    vector_store = FAISSVectorStore(dimension=embedder.get_embedding_dimension())
    vector_store.load()
    
    # Initialize retriever
    retriever = Retriever(vector_store=vector_store, embedder=embedder)
    
    # Initialize LLM client
    llm_client = LLMClient(use_local=False)
    
    # Initialize ingestion components
    document_loader = DocumentLoader()
    text_processor = TextProcessor()
    chunker = DocumentChunker()
    
    logger.info("All components initialized successfully")


@router.post("/upload-documents", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document.
    
    Steps:
    1. Validate file type and size
    2. Save file to upload directory
    3. Load and extract text
    4. Clean and chunk text
    5. Generate embeddings
    6. Store in vector database
    """
    try:
        # Validate file extension
        is_valid, message = validate_file_extension(file.filename)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)
        
        # Save uploaded file
        file_path = settings.upload_dir / safe_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Validate file size
        file_size = file_path.stat().st_size
        is_valid, message = validate_file_size(file_size)
        if not is_valid:
            file_path.unlink()  # Delete invalid file
            raise HTTPException(status_code=400, detail=message)
        
        logger.info(f"Processing uploaded file: {safe_filename}")
        
        # Load document
        doc_content = document_loader.load_document(file_path)
        
        # Process text
        cleaned_text = text_processor.process(doc_content.text)
        
        # Chunk document
        chunks = chunker.chunk_document(cleaned_text, doc_content.metadata)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="No valid chunks created from document")
        
        # Generate embeddings
        chunk_texts = [chunk.text for chunk in chunks]
        embeddings = embedder.embed_batch(chunk_texts)
        
        # Prepare metadata for vector store
        metadata_list = []
        for chunk in chunks:
            chunk_meta = {
                **chunk.metadata,
                "text": chunk.text,  # Store text in metadata for retrieval
                "upload_time": datetime.now().isoformat()
            }
            metadata_list.append(chunk_meta)
        
        # Add to vector store
        vector_ids = vector_store.add_documents(embeddings, metadata_list)
        
        # Save vector store
        vector_store.save()
        
        # Track document metadata
        document_metadata[safe_filename] = {
            "filename": safe_filename,
            "chunks": len(chunks),
            "upload_time": datetime.now().isoformat(),
            "file_type": doc_content.metadata.get("file_type"),
            "page_count": doc_content.metadata.get("page_count")
        }
        
        logger.info(f"Successfully processed {safe_filename}: {len(chunks)} chunks created")
        
        return UploadResponse(
            success=True,
            message=f"Document uploaded and processed successfully",
            document_id=safe_filename,
            chunks_created=len(chunks),
            metadata={
                "file_type": doc_content.metadata.get("file_type"),
                "page_count": doc_content.metadata.get("page_count"),
                "total_vectors": vector_store.index.ntotal
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Query the document store and generate an answer.
    
    Steps:
    1. Validate query
    2. Retrieve relevant chunks
    3. Format context
    4. Generate answer using LLM
    5. Return answer with sources
    """
    try:
        logger.info(f"Processing query: {request.question[:50]}...")
        
        # Retrieve relevant chunks
        results, retrieval_status = retriever.retrieve(
            query=request.question,
            top_k=request.top_k,
            filters=request.filters
        )
        
        # Handle case where no results found
        if not results:
            return QueryResponse(
                success=True,
                answer="I don't have enough information to answer this question based on the provided documents.",
                sources=[],
                retrieval_status=retrieval_status,
                metadata={"retrieved_chunks": 0}
            )
        
        # Create prompt with retrieved context
        messages = create_rag_prompt_with_sources(
            question=request.question,
            results=results
        )
        
        # Generate answer
        answer, llm_metadata = llm_client.generate(messages)
        
        # Get source citations
        citations = []
        if request.include_sources:
            for result in results:
                citation = SourceCitation(
                    source=result.metadata.get('source', 'Unknown'),
                    page=result.metadata.get('page_number'),
                    score=result.score
                )
                citations.append(citation)
        
        logger.info(f"Query answered successfully with {len(results)} sources")
        
        return QueryResponse(
            success=True,
            answer=answer,
            sources=citations,
            retrieval_status=retrieval_status,
            metadata={
                "retrieved_chunks": len(results),
                "llm_tokens": llm_metadata.get("total_tokens"),
                "elapsed_time": llm_metadata.get("elapsed_time")
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check system health and return statistics."""
    try:
        vector_stats = vector_store.get_stats()
        llm_stats = llm_client.get_usage_stats()
        
        return HealthResponse(
            status="healthy",
            vector_store_stats=vector_stats,
            llm_usage_stats=llm_stats
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents():
    """List all uploaded documents."""
    try:
        documents = []
        for doc_id, meta in document_metadata.items():
            doc_info = DocumentInfo(
                document_id=doc_id,
                filename=meta["filename"],
                chunks=meta["chunks"],
                upload_time=meta.get("upload_time")
            )
            documents.append(doc_info)
        
        vector_stats = vector_store.get_stats()
        
        return DocumentListResponse(
            success=True,
            documents=documents,
            total_documents=len(documents),
            total_chunks=vector_stats["total_vectors"]
        )
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.delete("/documents/{doc_id}", response_model=DeleteDocumentResponse)
async def delete_document(doc_id: str):
    """Delete a document from the vector store."""
    try:
        # Remove from vector store
        chunks_removed = vector_store.delete_document(doc_id)
        
        if chunks_removed == 0:
            raise HTTPException(status_code=404, detail=f"Document {doc_id} not found")
        
        # Save updated vector store
        vector_store.save()
        
        # Remove from metadata tracking
        if doc_id in document_metadata:
            del document_metadata[doc_id]
        
        # Delete file if exists
        file_path = settings.upload_dir / doc_id
        if file_path.exists():
            file_path.unlink()
        
        logger.info(f"Deleted document {doc_id}: {chunks_removed} chunks removed")
        
        return DeleteDocumentResponse(
            success=True,
            message=f"Document {doc_id} deleted successfully",
            chunks_removed=chunks_removed
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")
