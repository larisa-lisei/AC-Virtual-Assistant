import google.generativeai as genai

from core.config import settings

class LlmService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)

    def generate_answer(self, prompt: str):
        response = self.model.generate_content(prompt)
        return response.text if response.text else "No answer generated."