"""
Text chunking strategies for splitting documents into manageable pieces.
Uses recursive character splitting for semantic coherence.
"""

from typing import List, Dict
from dataclasses import dataclass
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tiktoken
from config.settings import settings
from src.utils.logger import get_logger

logger = get_logger()


@dataclass
class TextChunk:
    """Container for a text chunk with metadata."""
    text: str
    metadata: Dict[str, any]
    chunk_id: int
    start_char: int
    end_char: int


class DocumentChunker:
    """
    Document chunker using recursive character splitting.
    
    Strategy:
    - Chunk size: 800 tokens (configurable via settings)
    - Overlap: 100 tokens (ensures context continuity)
    - Splitting hierarchy: paragraphs → sentences → words
    - Preserves metadata for each chunk
    
    Rationale for 800 tokens:
    - Provides sufficient context for semantic understanding
    - Stays well within LLM context windows
    - Balances retrieval precision vs. context completeness
    - Overlap prevents information loss at chunk boundaries
    """
    
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        """
        Initialize chunker with configurable parameters.
        
        Args:
            chunk_size: Size of chunks in tokens (defaults to settings)
            chunk_overlap: Overlap between chunks in tokens (defaults to settings)
        """
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap
        
        # Initialize tokenizer for accurate token counting
        try:
            self.tokenizer = tiktoken.encoding_for_model(settings.embedding_model)
        except KeyError:
            # Fallback to cl100k_base encoding (used by most OpenAI models)
            logger.warning(f"Could not find encoding for {settings.embedding_model}, using cl100k_base")
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
        
        # Initialize LangChain's recursive splitter
        # Convert token counts to approximate character counts (1 token ≈ 4 characters)
        char_chunk_size = self.chunk_size * 4
        char_overlap = self.chunk_overlap * 4
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=char_chunk_size,
            chunk_overlap=char_overlap,
            length_function=self._count_tokens,
            separators=[
                "\n\n",  # Paragraph breaks (highest priority)
                "\n",    # Line breaks
                ". ",    # Sentence endings
                "! ",    # Exclamations
                "? ",    # Questions
                "; ",    # Semicolons
                ", ",    # Commas
                " ",     # Spaces
                ""       # Characters (last resort)
            ],
            keep_separator=True,
        )
        
        logger.info(f"Chunker initialized: {self.chunk_size} tokens, {self.chunk_overlap} overlap")
    
    def _count_tokens(self, text: str) -> int:
        """
        Count tokens in text using the configured tokenizer.
        
        Args:
            text: Text to count tokens for
            
        Returns:
            Number of tokens
        """
        return len(self.tokenizer.encode(text))
    
    def chunk_document(self, text: str, metadata: Dict[str, any]) -> List[TextChunk]:
        """
        Split document into chunks with metadata.
        
        Args:
            text: Document text to chunk
            metadata: Document metadata to attach to each chunk
            
        Returns:
            List of TextChunk objects
        """
        if not text or not text.strip():
            logger.warning("Empty text provided to chunker")
            return []
        
        # Split text using recursive splitter
        text_chunks = self.text_splitter.split_text(text)
        
        logger.info(f"Split document into {len(text_chunks)} chunks")
        
        # Create TextChunk objects with metadata
        chunks = []
        current_pos = 0
        
        for idx, chunk_text in enumerate(text_chunks):
            # Find chunk position in original text
            start_char = text.find(chunk_text, current_pos)
            if start_char == -1:
                start_char = current_pos
            end_char = start_char + len(chunk_text)
            current_pos = end_char
            
            # Create chunk metadata
            chunk_metadata = {
                **metadata,  # Include original document metadata
                "chunk_id": idx,
                "total_chunks": len(text_chunks),
                "chunk_tokens": self._count_tokens(chunk_text),
                "start_char": start_char,
                "end_char": end_char,
            }
            
            # Extract page number if present in chunk
            page_match = re.search(r'--- Page (\d+) ---', chunk_text)
            if page_match:
                chunk_metadata["page_number"] = int(page_match.group(1))
            
            chunk = TextChunk(
                text=chunk_text,
                metadata=chunk_metadata,
                chunk_id=idx,
                start_char=start_char,
                end_char=end_char
            )
            
            chunks.append(chunk)
        
        # Log statistics
        avg_tokens = sum(self._count_tokens(c.text) for c in chunks) / len(chunks)
        logger.info(f"Chunking complete: {len(chunks)} chunks, avg {avg_tokens:.0f} tokens/chunk")
        
        return chunks
    
    def get_chunk_statistics(self, chunks: List[TextChunk]) -> Dict[str, any]:
        """
        Calculate statistics about chunks.
        
        Args:
            chunks: List of chunks to analyze
            
        Returns:
            Dictionary with statistics
        """
        if not chunks:
            return {}
        
        token_counts = [self._count_tokens(c.text) for c in chunks]
        
        return {
            "total_chunks": len(chunks),
            "avg_tokens": sum(token_counts) / len(token_counts),
            "min_tokens": min(token_counts),
            "max_tokens": max(token_counts),
            "total_tokens": sum(token_counts),
        }


import re  # Add this import at the top of the file
