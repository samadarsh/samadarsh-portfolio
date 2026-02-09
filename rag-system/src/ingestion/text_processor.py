"""
Text processing utilities for cleaning and normalizing document text.
Prepares text for chunking and embedding.
"""

import re
import unicodedata
from typing import Optional
from src.utils.logger import get_logger

logger = get_logger()


class TextProcessor:
    """
    Text processor for cleaning and normalizing document text.
    
    Features:
    - Remove excessive whitespace
    - Normalize unicode characters
    - Remove or normalize special characters
    - Preserve sentence boundaries
    - Handle edge cases (empty text, non-text content)
    """
    
    def __init__(self, preserve_case: bool = True, remove_special_chars: bool = False):
        """
        Initialize text processor.
        
        Args:
            preserve_case: Whether to preserve original casing
            remove_special_chars: Whether to remove special characters
        """
        self.preserve_case = preserve_case
        self.remove_special_chars = remove_special_chars
    
    def process(self, text: str) -> str:
        """
        Process text through all cleaning and normalization steps.
        
        Args:
            text: Raw text to process
            
        Returns:
            Cleaned and normalized text
        """
        if not text or not text.strip():
            logger.warning("Empty text provided to processor")
            return ""
        
        # Apply processing steps in order
        text = self.normalize_unicode(text)
        text = self.normalize_whitespace(text)
        text = self.remove_page_markers(text)
        text = self.fix_line_breaks(text)
        
        if self.remove_special_chars:
            text = self.remove_special_characters(text)
        
        if not self.preserve_case:
            text = text.lower()
        
        text = self.final_cleanup(text)
        
        logger.debug(f"Processed text: {len(text)} characters")
        return text
    
    def normalize_unicode(self, text: str) -> str:
        """
        Normalize unicode characters to standard forms.
        
        Args:
            text: Text with potential unicode variations
            
        Returns:
            Text with normalized unicode
        """
        # Normalize to NFC form (canonical composition)
        text = unicodedata.normalize('NFC', text)
        
        # Replace common unicode quotes and dashes with ASCII equivalents
        replacements = {
            '\u2018': "'",  # Left single quote
            '\u2019': "'",  # Right single quote
            '\u201c': '"',  # Left double quote
            '\u201d': '"',  # Right double quote
            '\u2013': '-',  # En dash
            '\u2014': '--', # Em dash
            '\u2026': '...', # Ellipsis
        }
        
        for unicode_char, ascii_char in replacements.items():
            text = text.replace(unicode_char, ascii_char)
        
        return text
    
    def normalize_whitespace(self, text: str) -> str:
        """
        Normalize whitespace characters.
        
        Args:
            text: Text with irregular whitespace
            
        Returns:
            Text with normalized whitespace
        """
        # Replace tabs with spaces
        text = text.replace('\t', ' ')
        
        # Replace multiple spaces with single space
        text = re.sub(r' +', ' ', text)
        
        # Replace multiple newlines with double newline (paragraph break)
        text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
        
        # Remove spaces at the beginning and end of lines
        text = '\n'.join(line.strip() for line in text.split('\n'))
        
        return text
    
    def remove_page_markers(self, text: str) -> str:
        """
        Clean up page markers added during PDF extraction.
        Keep them in a cleaner format for context.
        
        Args:
            text: Text with page markers
            
        Returns:
            Text with cleaned page markers
        """
        # Normalize page markers to consistent format
        text = re.sub(r'\[Page\s+(\d+)\]\s*\n', r'\n--- Page \1 ---\n', text)
        
        return text
    
    def fix_line_breaks(self, text: str) -> str:
        """
        Fix broken lines that should be continuous.
        Common in PDFs where lines break mid-sentence.
        
        Args:
            text: Text with potential broken lines
            
        Returns:
            Text with fixed line breaks
        """
        # Join lines that don't end with sentence terminators
        # but preserve paragraph breaks (double newlines)
        lines = text.split('\n')
        fixed_lines = []
        
        for i, line in enumerate(lines):
            if not line.strip():
                fixed_lines.append(line)
                continue
            
            # If line doesn't end with sentence terminator and next line exists
            if i < len(lines) - 1 and line.strip() and not re.search(r'[.!?:;]$', line.strip()):
                # Check if next line starts with lowercase (likely continuation)
                next_line = lines[i + 1].strip()
                if next_line and next_line[0].islower():
                    fixed_lines.append(line.rstrip() + ' ')
                    continue
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def remove_special_characters(self, text: str) -> str:
        """
        Remove special characters while preserving sentence structure.
        
        Args:
            text: Text with special characters
            
        Returns:
            Text with special characters removed
        """
        # Keep alphanumeric, basic punctuation, and whitespace
        text = re.sub(r'[^a-zA-Z0-9\s.,!?;:()\-\'"]+', '', text)
        
        return text
    
    def final_cleanup(self, text: str) -> str:
        """
        Final cleanup pass to ensure text quality.
        
        Args:
            text: Processed text
            
        Returns:
            Final cleaned text
        """
        # Remove any remaining excessive whitespace
        text = re.sub(r' +', ' ', text)
        
        # Ensure no more than 2 consecutive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def extract_sentences(self, text: str) -> list[str]:
        """
        Split text into sentences for sentence-level processing.
        
        Args:
            text: Text to split
            
        Returns:
            List of sentences
        """
        # Simple sentence splitter (can be enhanced with NLTK if needed)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]
