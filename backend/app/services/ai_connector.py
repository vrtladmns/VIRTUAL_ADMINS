import os
import logging
import httpx
import asyncio
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv(encoding="utf-8", override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIConnector:
    def __init__(self):
        # Get Azure OpenAI configuration
        self.azure_resource = os.getenv("AZURE_AI_ENDPOINT", "").replace("https://", "").replace("http://", "").split("/")[0]
        self.azure_api_key = os.getenv("AZURE_AI_API_KEY")
        self.azure_deployment = os.getenv("AZURE_AI_DEPLOYMENT", "hr-onboarding-gpt4")
        self.api_version = "2024-12-01-preview"
        
        # Build the complete endpoint URL
        if self.azure_resource and self.azure_deployment:
            self.azure_endpoint = f"https://{self.azure_resource}/openai/deployments/{self.azure_deployment}/chat/completions?api-version={self.api_version}"
        else:
            self.azure_endpoint = None
        
        # Initialize shared HTTP client with HTTP/2 and connection pooling
        self._client: Optional[httpx.AsyncClient] = None
        self._client_lock = asyncio.Lock()
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create the shared HTTP client"""
        if self._client is None:
            async with self._client_lock:
                if self._client is None:
                    # Create client with HTTP/2, connection pooling, and gzip
                    self._client = httpx.AsyncClient(
                        http2=True,  # HTTP/2 enabled with h2 package
                        limits=httpx.Limits(
                            max_keepalive_connections=20,
                            max_connections=100,
                            keepalive_expiry=30.0
                        ),
                        timeout=httpx.Timeout(
                            connect=5.0,  # Shorter connect timeout
                            read=30.0,   # Reasonable read timeout
                            write=10.0,
                            pool=5.0
                        ),
                        headers={
                            "Accept-Encoding": "gzip, deflate",
                            "User-Agent": "HR-Onboarding-Bot/1.0"
                        }
                    )
        return self._client
    
    async def close(self):
        """Close the HTTP client"""
        if self._client:
            await self._client.aclose()
            self._client = None
    
    def _get_system_prompt(self, context: str, mode: str) -> str:
        """Generate system prompt based on context and mode"""
        base_prompt = """You are an HR Policy Assistant for a company. Your role is to provide accurate, helpful, and professional answers to employee questions about company policies.

IMPORTANT RULES:
1. Only answer based on the provided policy content - do not make up information
2. Be concise but comprehensive
3. Use a professional and friendly tone
4. If the question cannot be answered from the provided content, say so clearly
5. Always prioritize employee safety and compliance
6. Quote relevant policy sections when appropriate

POLICY CONTEXT:
{context}

MODE: {mode}

Please answer the employee's question based on the above policy information."""
        
        return base_prompt.format(context=context, mode=mode)
    
    async def ask_ai(self, question: str, context: str = "", mode: str = "global", max_tokens: int = 512) -> str:
        """Send question to Azure AI with policy context and return answer"""
        try:
            # Check if Azure AI is configured
            if not self.azure_endpoint or not self.azure_api_key:
                logger.error(f"Azure AI not configured. Endpoint: {self.azure_endpoint}, API Key: {'Set' if self.azure_api_key else 'Not Set'}")
                return "AI is not configured yet. Please check AZURE_AI_ENDPOINT and AZURE_AI_API_KEY in .env."
            
            logger.info(f"Calling Azure AI deployment: {self.azure_deployment} (mode: {mode})")
            
            # Generate system prompt with context
            system_prompt = self._get_system_prompt(context, mode)
            
            # Prepare request with enhanced context
            headers = {
                "api-key": self.azure_api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 1.0,
                "model": self.azure_deployment
            }
            
            # Get shared client and make request
            client = await self._get_client()
            response = await client.post(
                self.azure_endpoint,
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                # Log only essential info, not full response
                logger.info(f"Azure AI response received (status: {response.status_code}, latency: {response.elapsed.total_seconds():.2f}s)")
                
                # Handle different response formats
                if "choices" in data and len(data["choices"]) > 0:
                    answer = data["choices"][0]["message"]["content"]
                elif "answer" in data:
                    answer = data["answer"]
                else:
                    answer = "No answer received from AI service."
                    logger.warning(f"Unexpected response format: {list(data.keys())}")
                
                logger.info(f"AI question answered successfully in {mode} mode")
                return answer
            else:
                error_detail = response.text if response.text else "No error details"
                logger.error(f"Azure AI returned status {response.status_code}: {error_detail[:200]}...")
                return f"AI service returned error: {response.status_code}. Details: {error_detail}"
                
        except httpx.TimeoutException:
            logger.error("Timeout while calling Azure AI service")
            return "AI service request timed out. Please try again."
        except Exception as e:
            logger.error(f"Error calling Azure AI service: {str(e)}")
            return "Error connecting to AI service. Please try again later."
    
    async def ask_policy_question(self, question: str, context: str, mode: str = "auto", max_tokens: int = 512) -> str:
        """Specialized method for policy questions with context"""
        return await self.ask_ai(question, context, mode, max_tokens)
    
    async def ask_helpdesk_question(self, question: str, context: str, max_tokens: int = 512) -> str:
        """Specialized method for employee helpdesk questions with SOP context and company information"""
        try:
            # Enhanced helpdesk prompt with company information capability
            helpdesk_prompt = f"""You are an Employee Helpdesk Assistant for a company. Your role is to provide accurate, helpful, and professional answers to employee questions about company procedures, benefits, support, and general company information.

IMPORTANT RULES:
1. For SOP/procedure questions: Only answer based on the provided SOP content - do not make up information
2. For general company questions: You can provide helpful company information based on common HR knowledge
3. Be concise but comprehensive
4. Use a friendly and supportive tone
5. If the question cannot be answered from the provided content, say so clearly
6. Always prioritize employee well-being and support
7. Quote relevant SOP sections when appropriate
8. Provide actionable steps when possible
9. Be encouraging and helpful
10. For company culture, values, or general information questions, provide helpful guidance

EMPLOYEE SOP CONTEXT:
{context}

COMPANY INFORMATION CONTEXT:
You have access to general company information and can help with:
- Company culture and values
- General HR policies and best practices
- Employee benefits overview
- Workplace guidelines
- Professional development tips
- Team collaboration practices
- Company communication channels
- General workplace etiquette

Please answer the employee's question based on the above information. If it's an SOP-specific question, use the provided content. If it's a general company question, provide helpful guidance based on common HR knowledge."""
            
            # Prepare request with enhanced helpdesk prompt
            headers = {
                "api-key": self.azure_api_key,
                "Content-Type": "application/json"
            }
            
            payload = {
                "messages": [
                    {"role": "system", "content": helpdesk_prompt},
                    {"role": "user", "content": question}
                ],
                "max_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 1.0,
                "model": self.azure_deployment
            }
            
            # Get shared client and make request
            client = await self._get_client()
            response = await client.post(
                self.azure_endpoint,
                json=payload,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                # Log only essential info, not full response
                logger.info(f"Azure AI helpdesk response received (status: {response.status_code}, latency: {response.elapsed.total_seconds():.2f}s)")
                
                # Handle different response formats
                if "choices" in data and len(data["choices"]) > 0:
                    answer = data["choices"][0]["message"]["content"]
                elif "answer" in data:
                    answer = data["answer"]
                else:
                    answer = "No answer received from AI service."
                    logger.warning(f"Unexpected response format: {list(data.keys())}")
                
                logger.info(f"AI helpdesk question answered successfully")
                return answer
            else:
                error_detail = response.text if response.text else "No error details"
                logger.error(f"Azure AI returned status {response.status_code}: {error_detail[:200]}...")
                return f"AI service returned error: {response.status_code}. Details: {error_detail}"
                
        except httpx.TimeoutException:
            logger.error("Timeout while calling Azure AI service")
            return "AI service request timed out. Please try again."
        except Exception as e:
            logger.error(f"Error calling Azure AI service: {str(e)}")
            return "Error connecting to AI service. Please try again later."
    
    async def ask_onboarding_question(self, question: str, context: str, session_id: str, current_step: int, policy_id: str, max_tokens: int = 512) -> str:
        """Enhanced method for onboarding questions with session context"""
        try:
            # Enhance context with onboarding information
            onboarding_context = f"""
ONBOARDING CONTEXT:
- Current Step: {current_step} of 17
- Policy: {policy_id}
- Session: {session_id}

POLICY CONTENT:
{context}

INSTRUCTIONS:
You are helping an employee during their onboarding process. They are currently on step {current_step} of 17.
Provide helpful, encouraging answers that guide them through understanding this policy.
If they seem confused, offer to clarify or suggest they can ask more questions.
Always be supportive and patient - this is their learning journey.
"""
            
            # Call Azure AI with enhanced context
            answer = await self.ask_ai(question, onboarding_context, "guided", max_tokens)
            
            # Track that AI was used for this policy
            try:
                from .progress_tracker import progress_tracker
                progress_tracker.increment_ai_answers_used(session_id, policy_id)
            except Exception as e:
                logger.warning(f"Failed to track AI usage: {str(e)}")
            
            return answer
            
        except Exception as e:
            logger.error(f"Error in onboarding question: {str(e)}")
            return "I'm having trouble processing your question right now. Please try again or contact HR for assistance."


# Global instance
ai_connector = AIConnector()

# Cleanup function for app shutdown
async def cleanup_ai_connector():
    """Cleanup function to close the HTTP client on app shutdown"""
    await ai_connector.close()
