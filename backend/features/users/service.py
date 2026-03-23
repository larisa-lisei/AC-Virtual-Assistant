from fastapi import HTTPException, status

from .repository import UserRepository
from .schemas import (
    CreateStudentRequest, 
    CreateProfessorRequest,
    StudentResponse,
    ProfessorResponse,
    UpdateStudentRequest,
    UpdateProfessorRequest,
    StudentFiltersParams,
    ProfessorFiltersParams
)

from .exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError
)

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def _to_student_response(self, user: dict) -> StudentResponse:
        return StudentResponse(
            id=str(user["_id"]),
            email=user["email"],
            role=user["role"],
            degree=user["degree"],
            program=user["program"],
            year=user["year"],
            specialization=user.get("specialization"),
            group=user["group"]
        )
    
    def _to_professor_reponse(self, user: dict) -> ProfessorResponse:
        return ProfessorResponse(
            id=str(user["_id"]),
            email=user["email"],
            role=user["role"],
            program=user["program"]
        )

    def create_user(
        self, user_data: CreateStudentRequest | CreateProfessorRequest
    ) -> StudentResponse | ProfessorResponse:
        
        if self.repository.find_by_email(user_data.email):
            raise UserAlreadyExistsError(user_data.email)
        
        created_user = self.repository.create_user(user_data.model_dump())

        if created_user["role"] == "student":
            return self._to_student_response(created_user)
        
        return self._to_professor_reponse(created_user)
    
    def get_students(self, filters: StudentFiltersParams) -> list[StudentResponse]:
        students = self.repository.get_students(filters.model_dump(exclude_none=True))
        return [self._to_student_response(student) for student in students]

    def get_professors(self, filters: StudentFiltersParams) -> list[ProfessorResponse]:
        professors = self.repository.get_professors(filters.model_dump(exclude_none=True))
        return [self._to_professor_reponse(professor) for professor in professors]

    def delete_user(self, user_email: str):
        deleted_user = self.repository.delete_user(user_email)

        if not deleted_user:
            raise UserNotFoundError(user_email)

    def update_student(self, current_email: str, user_data: UpdateStudentRequest) -> StudentResponse:
        student = self.repository.find_by_email(current_email)

        if not student:
            raise UserNotFoundError(current_email)
        
        update_data = user_data.model_dump(exclude_unset=True)

        if not update_data:
            raise ValueError("No fields were provided for update.")
        
        new_email = update_data.get("email")
        if new_email and new_email != current_email:
            if self.repository.find_by_email(new_email):
                raise UserAlreadyExistsError(new_email)

        self.repository.update_user_by_email(current_email, update_data)

        updated_student = self.repository.find_by_email(new_email if new_email else current_email)

        return StudentResponse(
            id=str(updated_student["_id"]),
            email=updated_student["email"],
            role=updated_student["role"],
            degree=updated_student["degree"],
            program=updated_student["program"],
            year=updated_student["year"],
            specialization=updated_student.get("specialization"),
            group=updated_student["group"]
        ) 
    
    def update_professor(self, current_email: str, user_data: UpdateProfessorRequest) -> ProfessorResponse:
        professor = self.repository.find_by_email(current_email)

        if not professor:
            raise UserNotFoundError(current_email)
        
        update_data = user_data.model_dump(exclude_unset=True)

        if not update_data:
            raise ValueError("No fields were provided for update.")
        
        new_email = update_data.get("email")
        if new_email and new_email != current_email:
            if self.repository.find_by_email(new_email):
                raise UserAlreadyExistsError(new_email)

        self.repository.update_user_by_email(current_email, update_data)

        updated_professor = self.repository.find_by_email(new_email if new_email else current_email)
        
        return ProfessorResponse(
            id=str(updated_professor["_id"]),
            email=updated_professor["email"],
            role=updated_professor["role"],
            program=updated_professor["program"],
        )
        
