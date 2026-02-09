"""
Embedding generation for text chunks.
Supports OpenAI embeddings and Hugging Face models.
"""

from typing import List, Optional
import numpy as np
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from config.settings import settings
from src.utils.logger import get_logger
import time

logger = get_logger()


class Embedder:
    """
    Text embedding generator supporting multiple backends.
    
    Backends:
    - OpenAI: text-embedding-3-small (default, high quality)
    - Hugging Face: sentence-transformers (fallback, free)
    
    Features:
    - Batch processing for efficiency
    - Retry logic with exponential backoff
    - Caching to avoid re-embedding
    - Error handling and logging
    """
    
    def __init__(self, use_openai: bool = True):
        """
        Initialize embedder with specified backend.
        
        Args:
            use_openai: Whether to use OpenAI embeddings (vs Hugging Face)
        """
        self.use_openai = use_openai
        self.embedding_cache = {}
        
        if self.use_openai:
            self.client = OpenAI(api_key=settings.openai_api_key)
            self.model = settings.embedding_model
            self.dimensions = settings.embedding_dimensions
            logger.info(f"Embedder initialized with OpenAI: {self.model}")
        else:
            # Use Hugging Face sentence-transformers as fallback
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            self.dimensions = 384  # Dimension for all-MiniLM-L6-v2
            logger.info("Embedder initialized with Hugging Face: all-MiniLM-L6-v2")
    
    def embed_text(self, text: str, use_cache: bool = True) -> np.ndarray:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
            use_cache: Whether to use cached embeddings
            
        Returns:
            Embedding vector as numpy array
        """
        if not text or not text.strip():
            logger.warning("Empty text provided to embedder")
            return np.zeros(self.dimensions)
        
        # Check cache
        if use_cache and text in self.embedding_cache:
            logger.debug("Using cached embedding")
            return self.embedding_cache[text]
        
        # Generate embedding
        if self.use_openai:
            embedding = self._embed_openai([text])[0]
        else:
            embedding = self._embed_huggingface([text])[0]
        
        # Cache result
        if use_cache:
            self.embedding_cache[text] = embedding
        
        return embedding
    
    def embed_batch(self, texts: List[str], batch_size: int = 100) -> List[np.ndarray]:
        """
        Generate embeddings for multiple texts in batches.
        
        Args:
            texts: List of texts to embed
            batch_size: Number of texts to process per batch
            
        Returns:
            List of embedding vectors
        """
        if not texts:
            logger.warning("Empty text list provided to embedder")
            return []
        
        logger.info(f"Embedding {len(texts)} texts in batches of {batch_size}")
        
        embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            if self.use_openai:
                batch_embeddings = self._embed_openai(batch)
            else:
                batch_embeddings = self._embed_huggingface(batch)
            
            embeddings.extend(batch_embeddings)
            
            logger.debug(f"Processed batch {i // batch_size + 1}/{(len(texts) - 1) // batch_size + 1}")
        
        logger.info(f"Successfully embedded {len(embeddings)} texts")
        return embeddings
    
    def _embed_openai(self, texts: List[str], max_retries: int = 3) -> List[np.ndarray]:
        """
        Generate embeddings using OpenAI API with retry logic.
        
        Args:
            texts: List of texts to embed
            max_retries: Maximum number of retry attempts
            
        Returns:
            List of embedding vectors
        """
        for attempt in range(max_retries):
            try:
                response = self.client.embeddings.create(
                    model=self.model,
                    input=texts,
                    encoding_format="float"
                )
                
                embeddings = [np.array(item.embedding, dtype=np.float32) for item in response.data]
                return embeddings
                
            except Exception as e:
                wait_time = 2 ** attempt  # Exponential backoff
                logger.warning(f"OpenAI embedding attempt {attempt + 1} failed: {str(e)}")
                
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"All retry attempts failed for OpenAI embeddings")
                    raise
    
    def _embed_huggingface(self, texts: List[str]) -> List[np.ndarray]:
        """
        Generate embeddings using Hugging Face sentence-transformers.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            embeddings = self.model.encode(
                texts,
                convert_to_numpy=True,
                show_progress_bar=False,
                normalize_embeddings=True  # Normalize for cosine similarity
            )
            
            return [emb.astype(np.float32) for emb in embeddings]
            
        except Exception as e:
            logger.error(f"Hugging Face embedding failed: {str(e)}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of embeddings produced by this embedder."""
        return self.dimensions
    
    def clear_cache(self):
        """Clear the embedding cache."""
        self.embedding_cache.clear()
        logger.info("Embedding cache cleared")
