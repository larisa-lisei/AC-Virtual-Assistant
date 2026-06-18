from typing import Optional

from pydantic import BaseModel, Field
   
class DocumentUploadResponse(BaseModel):
    doc_id: str = Field(..., min_length=1)
    filename: str = Field(..., min_length=1)
    chunks_indexed: int = Field(..., ge=1)

class ChatRequest(BaseModel):
    course_id: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1, max_length=2000)

class SourceChunk(BaseModel):
    content: str
    page: Optional[int] = None
    filename: Optional[str] = None
    chunk_index: Optional[int] = None

class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]