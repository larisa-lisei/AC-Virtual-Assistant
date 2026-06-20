from openai import BaseModel
from pydantic import Field

from .enums import ConvRole

class ConversationSourceResponse(BaseModel):
    content: str | None = None
    filename: str | None = None
    page: int | None = None
    chunk_index: int | None = None

class HistoryMessageResponse(BaseModel):
    sender: ConvRole
    content: str
    sources: list[ConversationSourceResponse] = Field(default_factory=list)

class ConversationHistoryResponse(BaseModel):
    conversation_id: str | None = None
    messages: list[HistoryMessageResponse] = Field(default_factory=list)