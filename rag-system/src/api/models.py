"""
Pydantic models for API request/response validation.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class UploadResponse(BaseModel):
    """Response model for document upload."""
    success: bool
    message: str
    document_id: str
    chunks_created: int
    metadata: Optional[Dict[str, Any]] = None


class QueryRequest(BaseModel):
    """Request model for query endpoint."""
    question: str = Field(..., min_length=3, max_length=500, description="User's question")
    top_k: Optional[int] = Field(default=None, ge=1, le=10, description="Number of chunks to retrieve")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Metadata filters")
    include_sources: bool = Field(default=True, description="Include source citations in response")
    
    @field_validator('question')
    @classmethod
    def validate_question(cls, v: str) -> str:
        """Validate and clean question."""
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty")
        return v


class SourceCitation(BaseModel):
    """Model for source citation."""
    source: str
    page: Optional[int] = None
    score: float = Field(..., ge=0.0, le=1.0)


class QueryResponse(BaseModel):
    """Response model for query endpoint."""
    success: bool
    answer: str
    sources: List[SourceCitation] = []
    retrieval_status: str
    metadata: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Response model for errors."""
    success: bool = False
    error_code: str
    message: str
    details: Optional[str] = None


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    vector_store_stats: Dict[str, Any]
    llm_usage_stats: Dict[str, Any]


class DocumentInfo(BaseModel):
    """Model for document information."""
    document_id: str
    filename: str
    chunks: int
    upload_time: Optional[str] = None


class DocumentListResponse(BaseModel):
    """Response model for listing documents."""
    success: bool
    documents: List[DocumentInfo]
    total_documents: int
    total_chunks: int


class DeleteDocumentResponse(BaseModel):
    """Response model for document deletion."""
    success: bool
    message: str
    chunks_removed: int
