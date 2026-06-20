from fastapi import APIRouter, Depends, status, HTTPException

from .schemas import ProfessorChatResponse
from .service import FeedbackService

from features.rag.schemas import ChatRequest
from features.auth.dependencies import CurrentUser, get_current_user, require_role
from features.feedback.dependencies import get_feedback_service
from db.exceptions import InvalidIdError
from features.courses.exceptions import (
    CourseNotFoundError,
    CourseAccessDeniedError
)
from features.conversations.exceptions import ConversationAccessDeniedError, ConversationNotFoundError
from features.conversations.schemas import ConversationHistoryResponse
from features.users.enums import UserRole

router = APIRouter(prefix="/api/courses")

@router.post(
    "/{course_id}/ask/feedback",
    response_model=ProfessorChatResponse,
    status_code=status.HTTP_200_OK
)
def ask_for_feedback(
    course_id: str,
    request: ChatRequest,
    current_user: CurrentUser = Depends(require_role(UserRole.professor)),
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    try:
        return feedback_service.generate_professor_feedback(
            course_id=course_id,
            professor_question=request.question,
            conversation_id=request.conversation_id,
            current_user=current_user
        )
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except ConversationNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ConversationAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

@router.get(
    "/{course_id}/conversation/feedback",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK
)
def get_active_feedback_conversation(
    course_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.professor.value)),
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    try:
        return feedback_service.get_active_feedback_conversation(course_id, current_user)
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    
@router.delete(
    "/{course_id}/conversation/feedback",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_active_feedback_conversation(
    course_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.professor.value)),
    feedback_service: FeedbackService = Depends(get_feedback_service)
):
    try:
        feedback_service.delete_active_feedback_conversation(course_id, current_user)
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    