from pydantic import BaseModel, Field
   
class DocumentUploadResponse(BaseModel):
    doc_id: str 
    filename: str
    chunks_indexed: int

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    conversation_id: str | None = None

class SourceChunk(BaseModel):
    content: str
    page: int | None = None
    filename: str | None = None
    chunk_index: int | None = None

class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[SourceChunk] = Field(default_factory=list)