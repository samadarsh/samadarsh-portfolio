"""
Input validation utilities for the RAG system.
Validates file types, queries, and other user inputs.
"""

import re
from pathlib import Path
from typing import List, Tuple


# Supported file extensions
SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".docx"}

# Maximum file size (50 MB)
MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Query validation
MIN_QUERY_LENGTH = 3
MAX_QUERY_LENGTH = 500


def validate_file_extension(filename: str) -> Tuple[bool, str]:
    """
    Validate if the file extension is supported.
    
    Args:
        filename: Name of the file to validate
        
    Returns:
        Tuple of (is_valid, message)
    """
    file_path = Path(filename)
    extension = file_path.suffix.lower()
    
    if extension not in SUPPORTED_EXTENSIONS:
        return False, f"Unsupported file type: {extension}. Supported types: {', '.join(SUPPORTED_EXTENSIONS)}"
    
    return True, "Valid file extension"


def validate_file_size(file_size: int) -> Tuple[bool, str]:
    """
    Validate if the file size is within acceptable limits.
    
    Args:
        file_size: Size of the file in bytes
        
    Returns:
        Tuple of (is_valid, message)
    """
    if file_size > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds maximum limit of {MAX_FILE_SIZE_MB} MB"
    
    if file_size == 0:
        return False, "File is empty"
    
    return True, "Valid file size"


def validate_query(query: str) -> Tuple[bool, str]:
    """
    Validate user query for length and content.
    
    Args:
        query: User's question/query
        
    Returns:
        Tuple of (is_valid, message)
    """
    # Strip whitespace
    query = query.strip()
    
    # Check length
    if len(query) < MIN_QUERY_LENGTH:
        return False, f"Query too short. Minimum length: {MIN_QUERY_LENGTH} characters"
    
    if len(query) > MAX_QUERY_LENGTH:
        return False, f"Query too long. Maximum length: {MAX_QUERY_LENGTH} characters"
    
    # Check if query is not just special characters
    if not re.search(r'[a-zA-Z0-9]', query):
        return False, "Query must contain alphanumeric characters"
    
    return True, "Valid query"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and other security issues.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Get just the filename, remove any path components
    filename = Path(filename).name
    
    # Remove or replace dangerous characters
    # Keep alphanumeric, dots, hyphens, underscores
    sanitized = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Prevent hidden files
    if sanitized.startswith('.'):
        sanitized = '_' + sanitized[1:]
    
    # Limit length
    if len(sanitized) > 255:
        name, ext = Path(sanitized).stem, Path(sanitized).suffix
        sanitized = name[:255-len(ext)] + ext
    
    return sanitized


def validate_top_k(top_k: int) -> Tuple[bool, str]:
    """
    Validate top_k parameter for retrieval.
    
    Args:
        top_k: Number of results to retrieve
        
    Returns:
        Tuple of (is_valid, message)
    """
    if top_k < 1:
        return False, "top_k must be at least 1"
    
    if top_k > 10:
        return False, "top_k cannot exceed 10"
    
    return True, "Valid top_k value"
