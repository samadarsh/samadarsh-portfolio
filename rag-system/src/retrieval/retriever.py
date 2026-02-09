"""
Retrieval system for finding relevant document chunks.
Implements semantic similarity search with filtering and scoring.
"""

from typing import List, Dict, Optional, Tuple
import numpy as np
from dataclasses import dataclass
from config.settings import settings
from src.retrieval.vector_store import FAISSVectorStore
from src.ingestion.embedder import Embedder
from src.utils.logger import get_logger

logger = get_logger()


@dataclass
class RetrievalResult:
    """Container for a retrieval result."""
    text: str
    metadata: Dict
    score: float
    rank: int


class Retriever:
    """
    Semantic retriever for finding relevant document chunks.
    
    Features:
    - Semantic similarity search using embeddings
    - Top-k retrieval with configurable k
    - Score thresholding to filter low-quality matches
    - Metadata filtering (by source, page, etc.)
    - Graceful handling of edge cases
    
    Retrieval Failure Cases:
    1. Empty index → return empty results with informative message
    2. All scores below threshold → return "no relevant information"
    3. Query too vague → suggest more specific question
    """
    
    def __init__(self, vector_store: FAISSVectorStore, embedder: Embedder):
        """
        Initialize retriever.
        
        Args:
            vector_store: FAISS vector store instance
            embedder: Embedder instance for query embedding
        """
        self.vector_store = vector_store
        self.embedder = embedder
        self.similarity_threshold = settings.similarity_threshold
        
        logger.info(f"Retriever initialized with threshold {self.similarity_threshold}")
    
    def retrieve(
        self,
        query: str,
        top_k: int = None,
        filters: Optional[Dict] = None,
        min_score: Optional[float] = None
    ) -> Tuple[List[RetrievalResult], str]:
        """
        Retrieve relevant document chunks for a query.
        
        Args:
            query: User's question/query
            top_k: Number of results to retrieve
            filters: Optional metadata filters (e.g., {'source': 'doc.pdf'})
            min_score: Minimum similarity score threshold
            
        Returns:
            Tuple of (results list, status message)
        """
        top_k = top_k or settings.top_k_results
        min_score = min_score or self.similarity_threshold
        
        # Check if index is empty
        if self.vector_store.index.ntotal == 0:
            logger.warning("Retrieval attempted on empty index")
            return [], "No documents have been uploaded yet. Please upload documents first."
        
        # Generate query embedding
        try:
            query_embedding = self.embedder.embed_text(query, use_cache=False)
        except Exception as e:
            logger.error(f"Error generating query embedding: {str(e)}")
            return [], f"Error processing query: {str(e)}"
        
        # Search vector store
        raw_results = self.vector_store.search(query_embedding, top_k=top_k * 2)  # Get extra for filtering
        
        if not raw_results:
            return [], "No results found in the document store."
        
        # Apply filters if provided
        if filters:
            raw_results = self._apply_filters(raw_results, filters)
        
        # Filter by minimum score
        filtered_results = [
            (meta, score) for meta, score in raw_results
            if score >= min_score
        ]
        
        # Check if all results were filtered out
        if not filtered_results:
            logger.info(f"All results below threshold {min_score}")
            return [], "No sufficiently relevant information found in the documents. Try rephrasing your question or being more specific."
        
        # Limit to top_k
        filtered_results = filtered_results[:top_k]
        
        # Create RetrievalResult objects
        results = []
        for rank, (metadata, score) in enumerate(filtered_results, start=1):
            result = RetrievalResult(
                text=metadata.get('text', ''),
                metadata=metadata,
                score=score,
                rank=rank
            )
            results.append(result)
        
        logger.info(f"Retrieved {len(results)} results for query (avg score: {np.mean([r.score for r in results]):.3f})")
        
        status = f"Found {len(results)} relevant chunks."
        return results, status
    
    def _apply_filters(
        self,
        results: List[Tuple[Dict, float]],
        filters: Dict
    ) -> List[Tuple[Dict, float]]:
        """
        Apply metadata filters to results.
        
        Args:
            results: List of (metadata, score) tuples
            filters: Dictionary of metadata filters
            
        Returns:
            Filtered results
        """
        filtered = []
        
        for metadata, score in results:
            match = True
            
            for key, value in filters.items():
                if key not in metadata or metadata[key] != value:
                    match = False
                    break
            
            if match:
                filtered.append((metadata, score))
        
        logger.debug(f"Filters reduced results from {len(results)} to {len(filtered)}")
        return filtered
    
    def format_context(self, results: List[RetrievalResult], include_metadata: bool = True) -> str:
        """
        Format retrieval results into context string for LLM.
        
        Args:
            results: List of retrieval results
            include_metadata: Whether to include source metadata
            
        Returns:
            Formatted context string
        """
        if not results:
            return "No relevant context found."
        
        context_parts = []
        
        for result in results:
            # Format source information
            source = result.metadata.get('source', 'Unknown')
            page = result.metadata.get('page_number', '')
            
            if include_metadata:
                if page:
                    header = f"[Source: {source}, Page {page}]"
                else:
                    header = f"[Source: {source}]"
                
                context_parts.append(f"{header}\n{result.text}")
            else:
                context_parts.append(result.text)
        
        context = "\n\n---\n\n".join(context_parts)
        
        logger.debug(f"Formatted context: {len(context)} characters")
        return context
    
    def get_source_citations(self, results: List[RetrievalResult]) -> List[Dict]:
        """
        Extract source citations from results.
        
        Args:
            results: List of retrieval results
            
        Returns:
            List of citation dictionaries
        """
        citations = []
        seen_sources = set()
        
        for result in results:
            source = result.metadata.get('source', 'Unknown')
            page = result.metadata.get('page_number', None)
            
            # Create unique identifier
            source_id = f"{source}:{page}" if page else source
            
            if source_id not in seen_sources:
                citation = {
                    'source': source,
                    'page': page,
                    'score': result.score
                }
                citations.append(citation)
                seen_sources.add(source_id)
        
        return citations
    
    def explain_retrieval(self, query: str, results: List[RetrievalResult]) -> str:
        """
        Generate explanation of retrieval results for debugging.
        
        Args:
            query: Original query
            results: Retrieval results
            
        Returns:
            Explanation string
        """
        if not results:
            return "No results retrieved."
        
        explanation = f"Query: '{query}'\n\n"
        explanation += f"Retrieved {len(results)} chunks:\n\n"
        
        for result in results:
            source = result.metadata.get('source', 'Unknown')
            page = result.metadata.get('page_number', 'N/A')
            chunk_id = result.metadata.get('chunk_id', 'N/A')
            
            explanation += f"Rank {result.rank}: {source} (Page {page}, Chunk {chunk_id})\n"
            explanation += f"  Score: {result.score:.3f}\n"
            explanation += f"  Preview: {result.text[:100]}...\n\n"
        
        return explanation
