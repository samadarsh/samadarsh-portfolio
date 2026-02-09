"""
LLM client for generating responses.
Supports OpenAI and local models via Ollama.
"""

from typing import List, Dict, Optional, Tuple
import time
from openai import OpenAI
import tiktoken
from config.settings import settings
from src.utils.logger import get_logger

logger = get_logger()


class LLMClient:
    """
    LLM client supporting multiple backends.
    
    Backends:
    - OpenAI: GPT-4, GPT-3.5-turbo (default)
    - Local: LLaMA, Mistral via Ollama (optional)
    
    Features:
    - Configurable temperature and max tokens
    - Token counting and cost tracking
    - Retry logic with exponential backoff
    - Response validation
    - Streaming support (optional)
    """
    
    def __init__(self, use_local: bool = None):
        """
        Initialize LLM client.
        
        Args:
            use_local: Whether to use local LLM (defaults to settings)
        """
        self.use_local = use_local if use_local is not None else settings.use_local_llm
        
        if self.use_local:
            # Initialize Ollama client
            self.client = OpenAI(
                base_url=settings.local_llm_base_url,
                api_key="ollama"  # Ollama doesn't need real API key
            )
            self.model = settings.local_llm_model
            logger.info(f"LLM client initialized with local model: {self.model}")
        else:
            # Initialize OpenAI client
            self.client = OpenAI(api_key=settings.openai_api_key)
            self.model = settings.llm_model
            logger.info(f"LLM client initialized with OpenAI: {self.model}")
        
        self.temperature = settings.llm_temperature
        self.max_tokens = settings.llm_max_tokens
        
        # Token tracking
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        
        # Initialize tokenizer for counting
        try:
            self.tokenizer = tiktoken.encoding_for_model(self.model)
        except KeyError:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def generate(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        max_retries: int = 3
    ) -> Tuple[str, Dict]:
        """
        Generate response from LLM.
        
        Args:
            messages: List of message dictionaries
            temperature: Override default temperature
            max_tokens: Override default max tokens
            max_retries: Maximum retry attempts
            
        Returns:
            Tuple of (response text, metadata)
        """
        temperature = temperature if temperature is not None else self.temperature
        max_tokens = max_tokens if max_tokens is not None else self.max_tokens
        
        # Count input tokens
        prompt_tokens = self._count_message_tokens(messages)
        logger.debug(f"Prompt tokens: {prompt_tokens}")
        
        # Generate with retry logic
        for attempt in range(max_retries):
            try:
                start_time = time.time()
                
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                
                elapsed_time = time.time() - start_time
                
                # Extract response
                answer = response.choices[0].message.content
                
                # Track tokens
                completion_tokens = response.usage.completion_tokens
                self.total_prompt_tokens += prompt_tokens
                self.total_completion_tokens += completion_tokens
                
                # Prepare metadata
                metadata = {
                    "model": self.model,
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens,
                    "temperature": temperature,
                    "elapsed_time": elapsed_time,
                    "finish_reason": response.choices[0].finish_reason
                }
                
                logger.info(f"Generated response: {completion_tokens} tokens in {elapsed_time:.2f}s")
                
                return answer, metadata
                
            except Exception as e:
                wait_time = 2 ** attempt
                logger.warning(f"LLM generation attempt {attempt + 1} failed: {str(e)}")
                
                if attempt < max_retries - 1:
                    logger.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    logger.error("All retry attempts failed for LLM generation")
                    raise
    
    def generate_streaming(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        """
        Generate response with streaming (yields chunks).
        
        Args:
            messages: List of message dictionaries
            temperature: Override default temperature
            max_tokens: Override default max tokens
            
        Yields:
            Response chunks
        """
        temperature = temperature if temperature is not None else self.temperature
        max_tokens = max_tokens if max_tokens is not None else self.max_tokens
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"Streaming generation failed: {str(e)}")
            raise
    
    def _count_message_tokens(self, messages: List[Dict[str, str]]) -> int:
        """
        Count tokens in messages.
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            Total token count
        """
        # Approximate token count for messages
        # Format: <|start|>{role}\n{content}<|end|>\n
        num_tokens = 0
        
        for message in messages:
            num_tokens += 4  # Message formatting tokens
            for key, value in message.items():
                num_tokens += len(self.tokenizer.encode(value))
        
        num_tokens += 2  # Assistant reply priming
        
        return num_tokens
    
    def validate_response(self, response: str) -> Dict[str, any]:
        """
        Validate LLM response for quality indicators.
        
        Args:
            response: Generated response
            
        Returns:
            Validation results
        """
        validation = {
            "is_valid": True,
            "issues": []
        }
        
        # Check for empty response
        if not response or not response.strip():
            validation["is_valid"] = False
            validation["issues"].append("Empty response")
            return validation
        
        # Check for truncation
        if response.endswith("...") or len(response) < 10:
            validation["issues"].append("Possibly truncated response")
        
        # Check for "I don't know" patterns (good for RAG)
        uncertainty_patterns = [
            "don't have enough information",
            "don't know",
            "not mentioned",
            "not provided in the context"
        ]
        
        has_uncertainty = any(pattern in response.lower() for pattern in uncertainty_patterns)
        validation["has_uncertainty"] = has_uncertainty
        
        return validation
    
    def get_usage_stats(self) -> Dict:
        """Get token usage statistics."""
        total_tokens = self.total_prompt_tokens + self.total_completion_tokens
        
        # Estimate cost (approximate for GPT-3.5-turbo)
        # $0.0015 per 1K prompt tokens, $0.002 per 1K completion tokens
        if not self.use_local:
            prompt_cost = (self.total_prompt_tokens / 1000) * 0.0015
            completion_cost = (self.total_completion_tokens / 1000) * 0.002
            total_cost = prompt_cost + completion_cost
        else:
            total_cost = 0.0  # Local models are free
        
        return {
            "prompt_tokens": self.total_prompt_tokens,
            "completion_tokens": self.total_completion_tokens,
            "total_tokens": total_tokens,
            "estimated_cost_usd": round(total_cost, 4)
        }
    
    def reset_usage_stats(self):
        """Reset token usage statistics."""
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        logger.info("Usage statistics reset")
