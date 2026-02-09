"""
Evaluation framework for RAG system quality assessment.
Measures context relevance, faithfulness, and answer quality.
"""

from typing import List, Dict, Tuple
from dataclasses import dataclass
from src.retrieval.retriever import RetrievalResult
from src.utils.logger import get_logger

logger = get_logger()


@dataclass
class EvaluationMetrics:
    """Container for evaluation metrics."""
    context_relevance: float  # 0-1: How relevant are retrieved chunks to query
    faithfulness: float  # 0-1: How grounded is answer in context
    answer_relevance: float  # 0-1: How well does answer address question
    has_uncertainty: bool  # Whether answer expresses uncertainty
    hallucination_risk: float  # 0-1: Risk of hallucination


class RAGEvaluator:
    """
    Evaluator for RAG system quality.
    
    Evaluation Dimensions:
    1. Context Relevance: Are retrieved chunks relevant to the query?
    2. Faithfulness: Is the answer grounded in the retrieved context?
    3. Answer Relevance: Does the answer address the question?
    4. Hallucination Detection: Does the answer contain fabricated information?
    """
    
    def __init__(self):
        self.evaluation_history = []
    
    def evaluate_retrieval(
        self,
        query: str,
        results: List[RetrievalResult],
        ground_truth_chunks: List[str] = None
    ) -> Dict[str, float]:
        """
        Evaluate retrieval quality.
        
        Args:
            query: User query
            results: Retrieved results
            ground_truth_chunks: Optional ground truth chunks for comparison
            
        Returns:
            Dictionary with retrieval metrics
        """
        if not results:
            return {
                "precision": 0.0,
                "avg_score": 0.0,
                "coverage": 0.0
            }
        
        # Calculate average retrieval score
        avg_score = sum(r.score for r in results) / len(results)
        
        # Calculate precision if ground truth available
        precision = 0.0
        if ground_truth_chunks:
            relevant_retrieved = sum(
                1 for r in results
                if any(gt in r.text for gt in ground_truth_chunks)
            )
            precision = relevant_retrieved / len(results) if results else 0.0
        
        metrics = {
            "precision": precision,
            "avg_score": avg_score,
            "num_results": len(results),
            "min_score": min(r.score for r in results),
            "max_score": max(r.score for r in results)
        }
        
        logger.info(f"Retrieval evaluation: avg_score={avg_score:.3f}, precision={precision:.3f}")
        return metrics
    
    def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: str,
        ground_truth_answer: str = None
    ) -> EvaluationMetrics:
        """
        Evaluate answer quality.
        
        Args:
            question: User question
            answer: Generated answer
            context: Retrieved context
            ground_truth_answer: Optional ground truth for comparison
            
        Returns:
            EvaluationMetrics object
        """
        # Check for uncertainty expressions (good sign in RAG)
        uncertainty_phrases = [
            "don't have enough information",
            "don't know",
            "not mentioned",
            "not stated",
            "unclear",
            "cannot find"
        ]
        
        answer_lower = answer.lower()
        has_uncertainty = any(phrase in answer_lower for phrase in uncertainty_phrases)
        
        # Estimate faithfulness (simple heuristic: check if answer content appears in context)
        faithfulness = self._estimate_faithfulness(answer, context)
        
        # Estimate answer relevance (simple heuristic: check keyword overlap)
        answer_relevance = self._estimate_relevance(question, answer)
        
        # Estimate context relevance
        context_relevance = self._estimate_relevance(question, context)
        
        # Estimate hallucination risk
        hallucination_risk = self._estimate_hallucination_risk(answer, context, has_uncertainty)
        
        metrics = EvaluationMetrics(
            context_relevance=context_relevance,
            faithfulness=faithfulness,
            answer_relevance=answer_relevance,
            has_uncertainty=has_uncertainty,
            hallucination_risk=hallucination_risk
        )
        
        # Store in history
        self.evaluation_history.append({
            "question": question,
            "answer": answer,
            "metrics": metrics
        })
        
        logger.info(f"Answer evaluation: faithfulness={faithfulness:.2f}, relevance={answer_relevance:.2f}, hallucination_risk={hallucination_risk:.2f}")
        
        return metrics
    
    def _estimate_faithfulness(self, answer: str, context: str) -> float:
        """
        Estimate how grounded the answer is in the context.
        Uses simple word overlap heuristic.
        """
        if not answer or not context:
            return 0.0
        
        # Tokenize (simple word-based)
        answer_words = set(answer.lower().split())
        context_words = set(context.lower().split())
        
        # Remove common stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were'}
        answer_words -= stop_words
        context_words -= stop_words
        
        if not answer_words:
            return 0.0
        
        # Calculate overlap
        overlap = len(answer_words & context_words)
        faithfulness = overlap / len(answer_words)
        
        return min(faithfulness, 1.0)
    
    def _estimate_relevance(self, question: str, text: str) -> float:
        """
        Estimate relevance using keyword overlap.
        """
        if not question or not text:
            return 0.0
        
        question_words = set(question.lower().split())
        text_words = set(text.lower().split())
        
        # Remove stop words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 'where', 'who'}
        question_words -= stop_words
        text_words -= stop_words
        
        if not question_words:
            return 0.0
        
        overlap = len(question_words & text_words)
        relevance = overlap / len(question_words)
        
        return min(relevance, 1.0)
    
    def _estimate_hallucination_risk(self, answer: str, context: str, has_uncertainty: bool) -> float:
        """
        Estimate risk of hallucination.
        """
        # If answer expresses uncertainty, low risk
        if has_uncertainty:
            return 0.1
        
        # Check for hallucination indicators
        hallucination_indicators = [
            "in general",
            "typically",
            "usually",
            "commonly",
            "it is known",
            "as we know",
            "generally speaking"
        ]
        
        answer_lower = answer.lower()
        indicator_count = sum(1 for ind in hallucination_indicators if ind in answer_lower)
        
        # Calculate faithfulness
        faithfulness = self._estimate_faithfulness(answer, context)
        
        # Risk increases with indicators and decreases with faithfulness
        risk = (indicator_count * 0.3) + (1 - faithfulness) * 0.7
        
        return min(risk, 1.0)
    
    def get_summary_statistics(self) -> Dict:
        """Get summary statistics from evaluation history."""
        if not self.evaluation_history:
            return {}
        
        metrics_list = [e["metrics"] for e in self.evaluation_history]
        
        return {
            "total_evaluations": len(self.evaluation_history),
            "avg_faithfulness": sum(m.faithfulness for m in metrics_list) / len(metrics_list),
            "avg_answer_relevance": sum(m.answer_relevance for m in metrics_list) / len(metrics_list),
            "avg_context_relevance": sum(m.context_relevance for m in metrics_list) / len(metrics_list),
            "avg_hallucination_risk": sum(m.hallucination_risk for m in metrics_list) / len(metrics_list),
            "uncertainty_rate": sum(1 for m in metrics_list if m.has_uncertainty) / len(metrics_list)
        }
