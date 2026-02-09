"""
Prompt templates for hallucination-resistant RAG.
Enforces strict context grounding and honest uncertainty.
"""

from typing import List, Dict
from src.retrieval.retriever import RetrievalResult


# System prompt that establishes the AI's role and constraints
SYSTEM_PROMPT = """You are a helpful AI assistant that answers questions strictly based on the provided context from documents.

CRITICAL RULES:
1. ONLY use information explicitly stated in the context provided below
2. If the answer is not in the context, you MUST respond with: "I don't have enough information to answer this question based on the provided documents."
3. Do NOT use external knowledge, assumptions, or information not present in the context
4. When providing answers, cite the source document name
5. If you're uncertain or the context is ambiguous, express that uncertainty clearly
6. Do not make up, infer, or extrapolate information beyond what is explicitly stated

Your goal is accuracy and honesty, not completeness. It is better to say "I don't know" than to provide incorrect information."""


# User prompt template for queries
USER_PROMPT_TEMPLATE = """Context from documents:

{context}

---

Question: {question}

Instructions: Answer the question based ONLY on the context above. If the answer is not in the context, say so clearly."""


# Alternative system prompt for more conversational tone
CONVERSATIONAL_SYSTEM_PROMPT = """You are a knowledgeable assistant helping users understand their documents. You answer questions based strictly on the provided document context.

Guidelines:
- Only reference information from the provided context
- Cite sources when answering (mention document names)
- If information is not in the context, politely say you don't have that information
- Be concise but thorough
- If the context is unclear or contradictory, acknowledge this"""


def create_rag_prompt(
    question: str,
    context: str,
    system_prompt: str = SYSTEM_PROMPT
) -> List[Dict[str, str]]:
    """
    Create a complete RAG prompt with system and user messages.
    
    Args:
        question: User's question
        context: Retrieved context from documents
        system_prompt: System prompt to use (defaults to strict prompt)
        
    Returns:
        List of message dictionaries for OpenAI API format
    """
    user_content = USER_PROMPT_TEMPLATE.format(
        context=context,
        question=question
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]
    
    return messages


def create_rag_prompt_with_sources(
    question: str,
    results: List[RetrievalResult],
    system_prompt: str = SYSTEM_PROMPT
) -> List[Dict[str, str]]:
    """
    Create RAG prompt with formatted source citations.
    
    Args:
        question: User's question
        results: List of retrieval results
        system_prompt: System prompt to use
        
    Returns:
        List of message dictionaries
    """
    # Format context with source information
    context_parts = []
    
    for i, result in enumerate(results, start=1):
        source = result.metadata.get('source', 'Unknown')
        page = result.metadata.get('page_number', '')
        
        if page:
            header = f"[Document {i}: {source}, Page {page}]"
        else:
            header = f"[Document {i}: {source}]"
        
        context_parts.append(f"{header}\n{result.text}")
    
    context = "\n\n---\n\n".join(context_parts)
    
    return create_rag_prompt(question, context, system_prompt)


def create_followup_prompt(
    question: str,
    context: str,
    previous_qa: List[Dict[str, str]]
) -> List[Dict[str, str]]:
    """
    Create prompt for follow-up questions with conversation history.
    
    Args:
        question: Current question
        context: Retrieved context
        previous_qa: Previous Q&A pairs [{"question": "...", "answer": "..."}]
        
    Returns:
        List of message dictionaries
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add previous conversation
    for qa in previous_qa:
        messages.append({"role": "user", "content": qa["question"]})
        messages.append({"role": "assistant", "content": qa["answer"]})
    
    # Add current question with context
    user_content = USER_PROMPT_TEMPLATE.format(
        context=context,
        question=question
    )
    messages.append({"role": "user", "content": user_content})
    
    return messages


def validate_response(response: str, context: str) -> Dict[str, any]:
    """
    Validate LLM response for potential hallucinations.
    
    Args:
        response: LLM's response
        context: Original context provided
        
    Returns:
        Dictionary with validation results
    """
    validation = {
        "is_valid": True,
        "warnings": [],
        "has_uncertainty": False
    }
    
    # Check for uncertainty expressions (good sign)
    uncertainty_phrases = [
        "i don't have enough information",
        "i don't know",
        "not mentioned in",
        "not stated in",
        "unclear from the context",
        "the context doesn't provide"
    ]
    
    response_lower = response.lower()
    
    for phrase in uncertainty_phrases:
        if phrase in response_lower:
            validation["has_uncertainty"] = True
            break
    
    # Check for potential hallucination indicators
    # (These are heuristics and not perfect)
    hallucination_indicators = [
        "in general",
        "typically",
        "usually",
        "it is known that",
        "commonly",
        "as we know"
    ]
    
    for indicator in hallucination_indicators:
        if indicator in response_lower:
            validation["warnings"].append(f"Potential external knowledge: '{indicator}'")
    
    # Check if response is suspiciously long compared to context
    if len(response) > len(context) * 0.5 and not validation["has_uncertainty"]:
        validation["warnings"].append("Response length is large relative to context")
    
    if validation["warnings"]:
        validation["is_valid"] = False
    
    return validation


# Prompt for evaluating answer quality (meta-prompt)
EVALUATION_PROMPT = """Evaluate the following answer based on these criteria:

Context: {context}

Question: {question}

Answer: {answer}

Evaluation Criteria:
1. Faithfulness: Is the answer grounded in the context? (Yes/No)
2. Relevance: Does the answer address the question? (Yes/No)
3. Completeness: Does the answer fully address the question given the context? (Partial/Complete)

Provide your evaluation in this format:
Faithfulness: [Yes/No]
Relevance: [Yes/No]
Completeness: [Partial/Complete]
Explanation: [Brief explanation]"""


def create_evaluation_prompt(question: str, context: str, answer: str) -> str:
    """
    Create prompt for evaluating answer quality.
    
    Args:
        question: Original question
        context: Context provided
        answer: Generated answer
        
    Returns:
        Evaluation prompt string
    """
    return EVALUATION_PROMPT.format(
        context=context,
        question=question,
        answer=answer
    )
