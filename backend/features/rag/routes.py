from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from .schemas import (
    DocumentUploadResponse,
    ChatResponse,
    ChatRequest
)
from .service import RagService
from .repository import RagRepository
from .exceptions import(
    InvalidDocumentError,
    DocumentProcessingError,
    NoRelevantDocsError,
    DocumentNotFoundError
)

from .llm_service import LlmService
from features.feedback.dependencies import get_feedback_service
from features.auth.dependencies import get_current_user, require_role
from features.auth.schemas import CurrentUser
from features.courses.dependencies import get_course_service
from features.courses.exceptions import CourseNotFoundError, CourseAccessDeniedError
from features.users.enums import UserRole
from features.users.exceptions import InvalidIdError

router = APIRouter(prefix="/api/courses")

def get_rag_service(
    feedback_service = Depends(get_feedback_service),
    course_service = Depends(get_course_service)
) -> RagService:
    return RagService(RagRepository(), LlmService(), feedback_service, course_service)

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
    except InvalidDocumentError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        ) from exc
    except InvalidIdError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {exc.id}"
        )
    except CourseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {exc.course_ids} not found"
        )
    except CourseAccessDeniedError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(exc)
        )
    except DocumentProcessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document {exc.doc}."
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
    doc_id: str,
    course_id: str,
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
    "/ask",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
def ask_question(
    request: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        return rag_service.answer_question(
            request.course_id,
            request.course_name,
            request.question,
        )
    except NoRelevantDocsError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        ) from exc

