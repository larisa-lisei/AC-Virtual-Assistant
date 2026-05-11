from fastapi import APIRouter, Depends, status, HTTPException
from .schemas import ProfessorChatResponse
from .service import FeedbackService
from .repository import FeedbackRepository
from features.rag.llm_service import LlmService
from features.rag.schemas import ChatRequest

router = APIRouter(prefix="/api/feedback")

def get_feedback_service() -> FeedbackService:
    return FeedbackService(FeedbackRepository(), LlmService())

@router.post(
    "/ask",
    response_model=ProfessorChatResponse,
    status_code=status.HTTP_200_OK
)
def ask_for_feedback(
    request: ChatRequest,
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    try:
        return feedback_service.generate_professor_feedback(
            course_id=request.course_id,
            course_name=request.course_name,
            professor_question=request.question
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            #detail="Failed to answer professor's feedback question."
            detail=str(e)
        ) from e
