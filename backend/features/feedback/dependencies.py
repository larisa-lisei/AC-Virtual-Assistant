from .repository import FeedbackRepository
from .service import FeedbackService
from features.rag.llm_service import LlmService

def get_feedback_service() -> FeedbackService:
    return FeedbackService(FeedbackRepository(), LlmService())