from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, EmailStr, Field, field_validator
from .enums import UserRole, DegreeType

class CreateStudentRequest(BaseModel):
    email: EmailStr
    role: Literal[UserRole.student]
    degree: DegreeType 
    program: str = Field(..., min_length=1, max_length=100)
    year: int = Field(..., ge=1, le=4)
    specialization: Optional[str] = Field(None, min_length=1, max_length=100)
    group: str = Field(..., min_length=1, max_length=10)

    @field_validator("program", "specialization", "group")
    @classmethod
    def no_blank_strings(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value

class CreateProfessorRequest(BaseModel):
    email: EmailStr
    role: Literal[UserRole.professor]
    program: str = Field(..., min_length=1, max_length=100)

    @field_validator("program")
    @classmethod
    def no_blank_program(cls, value: str) -> str | None:
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value

CreateUserRequest = Annotated[
    Union[CreateStudentRequest, CreateProfessorRequest],
    Field(discriminator="role")
]

class StudentResponse(BaseModel):
    id: str
    email: EmailStr
    role: UserRole
    degree: DegreeType
    program: str
    year: int
    specialization: Optional[str] = None 
    group: str

class ProfessorResponse(BaseModel):
    id: str 
    email: EmailStr
    role: UserRole
    program: str

class StudentFiltersParams(BaseModel):
    degree: Optional[DegreeType] = None
    program: Optional[str] = Field(None, min_length=1, max_length=100)
    year: Optional[int] = Field(None, ge=1, le=4)
    specialization: Optional[str] = Field(None, min_length=1, max_length=100)
    group: Optional[str] = None
    email: Optional[str] = None

    @field_validator("program", "specialization", "group", "email")
    @classmethod
    def no_blank_strings(cls, value: str) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value

class ProfessorFiltersParams(BaseModel):
    program: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = None

    @field_validator("program", "email")
    @classmethod
    def no_blank_strings(cls, value: str) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value

class UpdateStudentRequest(BaseModel):
    email: Optional[EmailStr] = None
    group: Optional[str]  = Field(None, min_length=1, max_length=10)

    @field_validator("group")
    @classmethod
    def no_blank_group(cls, value: str | None) -> str | None: 
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Group must not be blank.")
        return value
    
class UpdateProfessorRequest(BaseModel):
    email: Optional[EmailStr] = None
    program: Optional[str] = Field(None, min_length=1, max_length=100)

    @field_validator("program")
    @classmethod
    def no_blank_program(cls, value: str | None) -> str | None: 
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Program must not be blank.")
        
        return value


