from pydantic import BaseModel, Field, model_validator

from features.users.enums import (
    DegreeType,
    ProgramType,
    BachelorSpecialization,
    MasterCSITSpecialization,
    MasterSESpecialization
)

def get_allowed_specializations(
    degree: DegreeType,
    program: ProgramType,
    year: int
) -> set[str]:
    if degree == DegreeType.bachelor and program == ProgramType.csit and year == 4:
        return {specialization.value for specialization in BachelorSpecialization}
    
    if degree == DegreeType.master:
        if program == ProgramType.csit:
            return {specialization.value for specialization in MasterCSITSpecialization}
        elif program == ProgramType.se:
            return {specialization.value for specialization in MasterSESpecialization}

def validate_specialization_type(
    degree: DegreeType,
    program: ProgramType,
    year: int,
    specialization: str | None
):
    if specialization is None:
        return
    
    allowed_specializations = get_allowed_specializations(degree, program, year)

    if specialization not in allowed_specializations:
        raise ValueError(
            f"Specilization 'specialization' is not valid for "
            f"{degree.value} - {program.value}"
        )
    
class CreateCourseRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    degree: DegreeType
    program: ProgramType
    year: int = Field(..., ge=1, le=4)
    specialization: str | None = Field(None, min_length=1, max_length=100)

    @model_validator(mode="after")
    def validate_specialization(self):
        validate_specialization_type(self.degree, self.program, self.year, self.specialization)
        return self
    

class CourseResponse(BaseModel):
    id: str
    name: str = Field(..., min_length=1, max_length=100)
    degree: DegreeType
    program: ProgramType
    year: int = Field(..., ge=1, le=4)
    specialization: str | None = Field(None, min_length=1, max_length=100)
    
