"""
Logging utilities for the RAG system.
Provides structured logging with file and console output.
"""

import sys
from pathlib import Path
from loguru import logger
from config.settings import settings


def setup_logger():
    """
    Configure the application logger with file and console handlers.
    
    Features:
    - Structured logging with timestamps and log levels
    - Separate file and console outputs
    - Rotation and retention policies for log files
    - Request ID support for tracing
    """
    
    # Remove default handler
    logger.remove()
    
    # Console handler with colored output
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.log_level,
        colorize=True,
    )
    
    # File handler with rotation
    logger.add(
        settings.log_file,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level=settings.log_level,
        rotation="10 MB",  # Rotate when file reaches 10 MB
        retention="7 days",  # Keep logs for 7 days
        compression="zip",  # Compress rotated logs
        enqueue=True,  # Thread-safe logging
    )
    
    logger.info("Logger initialized successfully")
    return logger


# Initialize logger on import
app_logger = setup_logger()


def get_logger():
    """Get the application logger instance."""
    return app_logger
