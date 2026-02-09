"""
Configuration management for RAG system.
Loads and validates environment variables using pydantic-settings.
"""

from pathlib import Path
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All settings can be overridden via .env file or environment variables.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # OpenAI Configuration
    openai_api_key: str = Field(..., description="OpenAI API key for LLM and embeddings")
    
    # LLM Settings
    llm_model: str = Field(default="gpt-3.5-turbo", description="LLM model name")
    llm_temperature: float = Field(default=0.1, ge=0.0, le=2.0, description="LLM temperature for generation")
    llm_max_tokens: int = Field(default=1000, ge=1, le=4096, description="Maximum tokens for LLM response")
    
    # Embedding Settings
    embedding_model: str = Field(default="text-embedding-3-small", description="Embedding model name")
    embedding_dimensions: int = Field(default=1536, description="Embedding vector dimensions")
    
    # Chunking Configuration
    chunk_size: int = Field(default=800, ge=100, le=2000, description="Text chunk size in tokens")
    chunk_overlap: int = Field(default=100, ge=0, le=500, description="Overlap between chunks in tokens")
    
    # Retrieval Settings
    top_k_results: int = Field(default=3, ge=1, le=10, description="Number of top results to retrieve")
    similarity_threshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Minimum similarity score threshold")
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host address")
    api_port: int = Field(default=8000, ge=1024, le=65535, description="API port number")
    cors_origins: str = Field(default="http://localhost:8501", description="Comma-separated CORS origins")
    
    # Storage Paths
    upload_dir: Path = Field(default=Path("data/uploads"), description="Directory for uploaded documents")
    vector_store_dir: Path = Field(default=Path("data/vector_store"), description="Directory for FAISS indices")
    
    # Logging
    log_level: str = Field(default="INFO", description="Logging level")
    log_file: Path = Field(default=Path("logs/rag_system.log"), description="Log file path")
    
    # Optional: Local LLM (Ollama)
    use_local_llm: bool = Field(default=False, description="Use local LLM via Ollama")
    local_llm_base_url: Optional[str] = Field(default=None, description="Base URL for local LLM")
    local_llm_model: Optional[str] = Field(default=None, description="Local LLM model name")
    
    @field_validator("cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> List[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in v.split(",") if origin.strip()]
    
    @field_validator("upload_dir", "vector_store_dir", "log_file", mode="before")
    @classmethod
    def ensure_path(cls, v) -> Path:
        """Convert string paths to Path objects."""
        return Path(v) if isinstance(v, str) else v
    
    def create_directories(self) -> None:
        """Create necessary directories if they don't exist."""
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.vector_store_dir.mkdir(parents=True, exist_ok=True)
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
    
    @property
    def faiss_index_path(self) -> Path:
        """Path to FAISS index file."""
        return self.vector_store_dir / "faiss_index.bin"
    
    @property
    def metadata_path(self) -> Path:
        """Path to metadata file."""
        return self.vector_store_dir / "metadata.json"


# Global settings instance
settings = Settings()

# Create required directories on import
settings.create_directories()
