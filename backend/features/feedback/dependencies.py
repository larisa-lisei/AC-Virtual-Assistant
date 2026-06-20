from fastapi import Depends

from .repository import FeedbackRepository
from features.rag.llm_service import LlmService
from features.courses.service import CourseService
from features.courses.dependencies import get_course_service
from features.conversations.service import ConversationService
from features.conversations.dependencies import get_conversation_service
from .service import FeedbackService

def get_feedback_service(
        course_service: CourseService = Depends(get_course_service),
        conversation_service: ConversationService = Depends(get_conversation_service)
) -> FeedbackService:
    return FeedbackService(FeedbackRepository(), LlmService(), course_service, conversation_service)