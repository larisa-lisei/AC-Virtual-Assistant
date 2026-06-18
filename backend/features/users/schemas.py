from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from .enums import (
    UserRole,
    DegreeType, 
    ProgramType,
    BachelorSpecialization,
    MasterSESpecialization,
    MasterCSITSpecialization
)

from features.courses.schemas import CreateCourseRequest, validate_specialization_type

class CreateStudentRequest(BaseModel):
    email: EmailStr
    degree: DegreeType 
    program: ProgramType
    year: int = Field(..., ge=1, le=4)
    specialization: str | None = Field(None, min_length=1, max_length=100)
    group: str = Field(..., min_length=1, max_length=10)

    @field_validator("specialization", "group")
    @classmethod
    def no_blank_strings(cls, value: str | None) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value
    
    @model_validator(mode="after")
    def validate_specialization(self):
        validate_specialization_type(self.degree, self.program, self.specialization)
        return self

class CreateProfessorRequest(BaseModel):
    email: EmailStr
    program: ProgramType

    existing_course_ids: list[str] = Field(default_factory=list)
    new_course: CreateCourseRequest | None = None

class StudentResponse(BaseModel):
    id: str
    email: EmailStr
    role: UserRole
    degree: DegreeType
    program: str
    year: int
    specialization: Optional[str] = None 
    group: str
    is_active: bool

class ProfessorResponse(BaseModel):
    id: str 
    email: EmailStr
    role: UserRole
    program: str
    course_ids: list[str] = []
    course_names: list[str] = []
    is_active: bool

class StudentFiltersParams(BaseModel):
    degree: DegreeType | None = None
    program: ProgramType | None = None
    year: int | None = Field(None, ge=1, le=4)
    specialization: BachelorSpecialization | MasterSESpecialization | MasterCSITSpecialization | None = None
    search: str | None = None

    @field_validator("search")
    @classmethod
    def no_blank_strings(cls, value: str) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value

class ProfessorFiltersParams(BaseModel):
    program: ProgramType | None = None
    email: str | None = None
    search: str | None = None

    @field_validator("program", "email")
    @classmethod
    def no_blank_strings(cls, value: str) -> str | None:
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Field must not be blank.")
        return value

class UpdateStudentRequest(BaseModel):
    group: Optional[str]  = Field(None)

    @field_validator("group")
    @classmethod
    def no_blank_group(cls, value: str | None) -> str | None: 
        if value is None:
            return value
        if not value.strip():
            raise ValueError("Group must not be blank.")
        if len(value) > 10:
            raise ValueError("Group must not exceed 10 characters.")
        return value

    
class UpdateProfessorRequest(BaseModel):
    existing_course_ids: list[str] = Field(default_factory=list)
    new_course: CreateCourseRequest | None = None


