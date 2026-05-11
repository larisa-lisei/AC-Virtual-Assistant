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
    NoRelevantDocsError
)

from .llm_service import LlmService
from features.feedback.dependencies import get_feedback_service

router = APIRouter(prefix="/api/rag")

def get_rag_service() -> RagService:
    return RagService(RagRepository(), LlmService(), get_feedback_service())

@router.post(
    "/upload-document",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_document(
    course_id: str = Form(...),
    course_name: str = Form(...),
    file: UploadFile = File(...),
    rag_service: RagService = Depends(get_rag_service)
):
    try:
        return rag_service.upload_document(course_id, course_name, file)
    except InvalidDocumentError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        ) from exc
    except DocumentProcessingError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document {exc.doc}."
        )
    
@router.post(
    "/ask",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK
)
def ask_question(
    request: ChatRequest,
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

