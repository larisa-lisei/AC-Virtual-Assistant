from datetime import datetime

from openai import BaseModel

'''
class QuestionLogRequest(BaseModel):
    course_id: str = Field(..., min_length=1)
    course_name: str = Field(..., min_length=1)
    question: str = Field(..., min_length=1, max_length=2000)
    answer_status: str = Field(..., min_length=1)


class QuestionLogResponse(BaseModel):
    id: str
    course_id: str
    course_name: str
    question: str
    answer_status: str
    created_at: datetime
'''

class ProfessorChatResponse(BaseModel):
    answer: str