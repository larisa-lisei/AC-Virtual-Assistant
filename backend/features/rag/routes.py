from functools import lru_cache

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from .schemas import (
    DocumentUploadResponse,
    ChatResponse,
    ChatRequest,
)
from .service import RagService
from .repository import RagRepository
from .exceptions import(
    InvalidDocumentError,
    DocumentProcessingError,
    DocumentNotFoundError
)

from .llm_service import LlmService, get_llm_service
from features.auth.dependencies import get_current_user, require_role
from features.auth.schemas import CurrentUser
from features.courses.dependencies import get_course_service
from features.feedback.dependencies import get_feedback_service
from features.conversations.dependencies import get_conversation_service
from features.courses.exceptions import CourseNotFoundError, CourseAccessDeniedError
from features.users.enums import UserRole
from db.exceptions import InvalidIdError
from features.conversations.exceptions import ConversationNotFoundError, ConversationAccessDeniedError
from features.conversations.schemas import ConversationHistoryResponse

router = APIRouter(prefix="/api/courses")

@lru_cache
def get_rag_repository() -> RagRepository:
    return RagRepository()

def get_rag_service(
    rag_repository: RagRepository = Depends(get_rag_repository),
    llm_service: LlmService = Depends(get_llm_service),
    course_service = Depends(get_course_service),
    feedback_service = Depends(get_feedback_service),
    conversation_service = Depends(get_conversation_service)
) -> RagService:
    return RagService(rag_repository, llm_service, feedback_service, course_service, conversation_service)

@router.post(
    "/{course_id}/documents",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_document(
    course_id: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(require_role(UserRole.professor.value)),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        return rag_service.upload_document(course_id, file, current_user)
    except InvalidDocumentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {e.course_ids} not found"
        )
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except DocumentProcessingError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document {e.doc}."
        )
    
@router.get(
    "/{course_id}/documents",
    response_model=list[DocumentUploadResponse],
    status_code=status.HTTP_200_OK
)
def get_uploaded_documents(
    course_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.professor.value)),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        return rag_service.get_uploaded_documents(course_id, current_user)
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {e.course_ids} not found."
        )
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
        
@router.delete(
    "/{course_id}/documents/{doc_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_uploaded_document(
    course_id: str,
    doc_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.professor.value)),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        rag_service.delete_document(
            course_id=course_id,
            doc_id=doc_id,
            current_user=current_user
        )
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {e.course_ids} not found."
        )
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except DocumentNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document {e.doc_id} not found."
        )

@router.post(
    "/{course_id}/ask",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
def ask_question(
    course_id: str,
    request: ChatRequest,
    current_user: CurrentUser = Depends(require_role(UserRole.student.value, UserRole.professor.value)),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        return rag_service.answer_question(
            course_id=course_id,
            question=request.question,
            current_user=current_user,
            conversation_id=request.conversation_id
        )
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {e.course_ids} not found."
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
    "/{course_id}/conversation",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK
)
def get_active_conversation(
    course_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.student.value, UserRole.professor.value)),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        return rag_service.get_active_conversation(course_id, current_user)
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
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
    "/{course_id}/conversation",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_active_conversation(
    course_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.student.value, UserRole.professor.value)),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        rag_service.delete_active_conversation(course_id, current_user)
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
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

