from openai import BaseModel

class ProfessorChatResponse(BaseModel):
    conversation_id: str
    answer: str