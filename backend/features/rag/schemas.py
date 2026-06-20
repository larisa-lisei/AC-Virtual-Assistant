from typing import Optional

from pydantic import BaseModel, Field
from ..conversations.enums import ConvRole
   
class DocumentUploadResponse(BaseModel):
    doc_id: str = Field(..., min_length=1)
    filename: str = Field(..., min_length=1)
    chunks_indexed: int = Field(..., ge=1)

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    conversation_id: str | None = None

class SourceChunk(BaseModel):
    content: str
    page: Optional[int] = None
    filename: Optional[str] = None
    chunk_index: Optional[int] = None

class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[SourceChunk]