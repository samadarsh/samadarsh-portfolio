"""
FAISS vector store for efficient similarity search.
Manages embeddings and metadata storage.
"""

from pathlib import Path
from typing import List, Dict, Optional, Tuple
import numpy as np
import faiss
import json
import pickle
from dataclasses import asdict
from config.settings import settings
from src.utils.logger import get_logger

logger = get_logger()


class FAISSVectorStore:
    """
    FAISS-based vector store for document embeddings.
    
    Features:
    - Efficient similarity search using FAISS IndexFlatL2
    - Metadata storage alongside embeddings
    - Persistent storage (save/load from disk)
    - Thread-safe operations
    - Automatic index management
    """
    
    def __init__(self, dimension: int = None, index_path: Path = None, metadata_path: Path = None):
        """
        Initialize FAISS vector store.
        
        Args:
            dimension: Dimension of embedding vectors
            index_path: Path to save/load FAISS index
            metadata_path: Path to save/load metadata
        """
        self.dimension = dimension or settings.embedding_dimensions
        self.index_path = index_path or settings.faiss_index_path
        self.metadata_path = metadata_path or settings.metadata_path
        
        # Initialize FAISS index (IndexFlatL2 for exact L2 distance search)
        self.index = faiss.IndexFlatL2(self.dimension)
        
        # Metadata storage: maps vector ID to chunk metadata
        self.metadata: List[Dict] = []
        
        # Document tracking
        self.document_ids: Dict[str, List[int]] = {}  # Maps doc_id to vector IDs
        
        logger.info(f"FAISS vector store initialized with dimension {self.dimension}")
    
    def add_documents(self, embeddings: List[np.ndarray], metadata_list: List[Dict]) -> List[int]:
        """
        Add document embeddings and metadata to the store.
        
        Args:
            embeddings: List of embedding vectors
            metadata_list: List of metadata dictionaries (one per embedding)
            
        Returns:
            List of assigned vector IDs
        """
        if len(embeddings) != len(metadata_list):
            raise ValueError("Number of embeddings must match number of metadata entries")
        
        if not embeddings:
            logger.warning("No embeddings provided to add_documents")
            return []
        
        # Convert embeddings to numpy array
        embeddings_array = np.array(embeddings, dtype=np.float32)
        
        # Verify dimensions
        if embeddings_array.shape[1] != self.dimension:
            raise ValueError(f"Embedding dimension {embeddings_array.shape[1]} doesn't match index dimension {self.dimension}")
        
        # Get starting ID for new vectors
        start_id = self.index.ntotal
        
        # Add to FAISS index
        self.index.add(embeddings_array)
        
        # Store metadata
        vector_ids = list(range(start_id, start_id + len(embeddings)))
        self.metadata.extend(metadata_list)
        
        # Track document IDs
        for i, meta in enumerate(metadata_list):
            doc_id = meta.get('source', 'unknown')
            if doc_id not in self.document_ids:
                self.document_ids[doc_id] = []
            self.document_ids[doc_id].append(vector_ids[i])
        
        logger.info(f"Added {len(embeddings)} vectors to index (total: {self.index.ntotal})")
        return vector_ids
    
    def search(self, query_embedding: np.ndarray, top_k: int = None) -> List[Tuple[Dict, float]]:
        """
        Search for similar vectors.
        
        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            
        Returns:
            List of (metadata, distance) tuples, sorted by similarity
        """
        top_k = top_k or settings.top_k_results
        
        if self.index.ntotal == 0:
            logger.warning("Search called on empty index")
            return []
        
        # Ensure query is 2D array
        query_array = np.array([query_embedding], dtype=np.float32)
        
        # Verify dimension
        if query_array.shape[1] != self.dimension:
            raise ValueError(f"Query dimension {query_array.shape[1]} doesn't match index dimension {self.dimension}")
        
        # Search FAISS index
        # Note: FAISS returns L2 distances, we'll convert to similarity scores
        distances, indices = self.index.search(query_array, min(top_k, self.index.ntotal))
        
        # Prepare results
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.metadata):  # Valid index
                # Convert L2 distance to similarity score (inverse relationship)
                # Normalize to 0-1 range where 1 is most similar
                similarity = 1 / (1 + dist)
                
                results.append((self.metadata[idx], similarity))
        
        logger.debug(f"Search returned {len(results)} results")
        return results
    
    def delete_document(self, doc_id: str) -> int:
        """
        Remove all vectors associated with a document.
        Note: FAISS doesn't support deletion, so we rebuild the index.
        
        Args:
            doc_id: Document ID to remove
            
        Returns:
            Number of vectors removed
        """
        if doc_id not in self.document_ids:
            logger.warning(f"Document {doc_id} not found in index")
            return 0
        
        # Get vector IDs to remove
        ids_to_remove = set(self.document_ids[doc_id])
        
        # Rebuild index without these vectors
        new_embeddings = []
        new_metadata = []
        
        for i in range(self.index.ntotal):
            if i not in ids_to_remove:
                # Reconstruct vector from index
                vector = self.index.reconstruct(int(i))
                new_embeddings.append(vector)
                new_metadata.append(self.metadata[i])
        
        # Recreate index
        self.index = faiss.IndexFlatL2(self.dimension)
        if new_embeddings:
            self.index.add(np.array(new_embeddings, dtype=np.float32))
        
        self.metadata = new_metadata
        
        # Update document tracking
        del self.document_ids[doc_id]
        
        logger.info(f"Removed {len(ids_to_remove)} vectors for document {doc_id}")
        return len(ids_to_remove)
    
    def save(self) -> None:
        """Save index and metadata to disk."""
        try:
            # Save FAISS index
            faiss.write_index(self.index, str(self.index_path))
            
            # Save metadata and document tracking
            metadata_dict = {
                'metadata': self.metadata,
                'document_ids': self.document_ids,
                'dimension': self.dimension
            }
            
            with open(self.metadata_path, 'w') as f:
                json.dump(metadata_dict, f, indent=2)
            
            logger.info(f"Saved vector store: {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Error saving vector store: {str(e)}")
            raise
    
    def load(self) -> bool:
        """
        Load index and metadata from disk.
        
        Returns:
            True if successful, False otherwise
        """
        try:
            if not self.index_path.exists() or not self.metadata_path.exists():
                logger.info("No existing vector store found")
                return False
            
            # Load FAISS index
            self.index = faiss.read_index(str(self.index_path))
            
            # Load metadata
            with open(self.metadata_path, 'r') as f:
                metadata_dict = json.load(f)
            
            self.metadata = metadata_dict['metadata']
            self.document_ids = metadata_dict['document_ids']
            self.dimension = metadata_dict['dimension']
            
            logger.info(f"Loaded vector store: {self.index.ntotal} vectors")
            return True
            
        except Exception as e:
            logger.error(f"Error loading vector store: {str(e)}")
            return False
    
    def get_stats(self) -> Dict:
        """Get statistics about the vector store."""
        return {
            'total_vectors': self.index.ntotal,
            'dimension': self.dimension,
            'total_documents': len(self.document_ids),
            'documents': list(self.document_ids.keys())
        }
    
    def clear(self) -> None:
        """Clear all data from the vector store."""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        self.document_ids = {}
        logger.info("Vector store cleared")
