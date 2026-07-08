from functools import lru_cache

from google import genai

from core.config import settings

class LlmService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def generate_answer(self, prompt: str):
        response = self.client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        return response.text if response.text else "No answer generated."

    
@lru_cache
def get_llm_service() -> LlmService:
    return LlmService()