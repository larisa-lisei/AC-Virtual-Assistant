from enum import Enum

class ConvRole(str, Enum):
    user = "user"
    assistant = "assistant" 

class ConvType(str, Enum):
    course_assistant = "course_assistant"
    feedback = "feedback"