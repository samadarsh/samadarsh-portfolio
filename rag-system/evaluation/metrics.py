"""
Metrics tracking for RAG system performance.
"""

from typing import Dict, List
from dataclasses import dataclass, asdict
import json
from pathlib import Path
from datetime import datetime


@dataclass
class QueryMetrics:
    """Metrics for a single query."""
    timestamp: str
    question: str
    retrieval_time: float
    generation_time: float
    total_time: float
    chunks_retrieved: int
    tokens_used: int
    answer_length: int
    has_sources: bool


class MetricsTracker:
    """Track and analyze system metrics over time."""
    
    def __init__(self, metrics_file: Path = None):
        self.metrics_file = metrics_file or Path("data/metrics.json")
        self.metrics_file.parent.mkdir(parents=True, exist_ok=True)
        self.metrics: List[QueryMetrics] = []
        self.load_metrics()
    
    def track_query(
        self,
        question: str,
        retrieval_time: float,
        generation_time: float,
        chunks_retrieved: int,
        tokens_used: int,
        answer_length: int,
        has_sources: bool
    ):
        """Track metrics for a query."""
        metric = QueryMetrics(
            timestamp=datetime.now().isoformat(),
            question=question[:100],  # Truncate for privacy
            retrieval_time=retrieval_time,
            generation_time=generation_time,
            total_time=retrieval_time + generation_time,
            chunks_retrieved=chunks_retrieved,
            tokens_used=tokens_used,
            answer_length=answer_length,
            has_sources=has_sources
        )
        
        self.metrics.append(metric)
        self.save_metrics()
    
    def get_statistics(self) -> Dict:
        """Calculate aggregate statistics."""
        if not self.metrics:
            return {}
        
        return {
            "total_queries": len(self.metrics),
            "avg_retrieval_time": sum(m.retrieval_time for m in self.metrics) / len(self.metrics),
            "avg_generation_time": sum(m.generation_time for m in self.metrics) / len(self.metrics),
            "avg_total_time": sum(m.total_time for m in self.metrics) / len(self.metrics),
            "avg_chunks_retrieved": sum(m.chunks_retrieved for m in self.metrics) / len(self.metrics),
            "avg_tokens_used": sum(m.tokens_used for m in self.metrics) / len(self.metrics),
            "success_rate": sum(1 for m in self.metrics if m.has_sources) / len(self.metrics)
        }
    
    def save_metrics(self):
        """Save metrics to file."""
        with open(self.metrics_file, 'w') as f:
            json.dump([asdict(m) for m in self.metrics], f, indent=2)
    
    def load_metrics(self):
        """Load metrics from file."""
        if self.metrics_file.exists():
            with open(self.metrics_file, 'r') as f:
                data = json.load(f)
                self.metrics = [QueryMetrics(**m) for m in data]
