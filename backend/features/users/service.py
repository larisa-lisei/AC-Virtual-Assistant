from bson import ObjectId
from bson.errors import InvalidId

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
    UserNotFoundError,
    InvalidUserIdError
)

from features.auth.utils import create_activation_token
from features.auth.email import send_activation_email

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
    
    def _to_professor_response(self, user: dict) -> ProfessorResponse:
        return ProfessorResponse(
            id=str(user["_id"]),
            email=user["email"],
            role=user["role"],
            program=user["program"]
        )
    
    def _validate_user_id(self, user_id: str):
        try:
            ObjectId(user_id)
        except InvalidId:
            raise InvalidUserIdError(user_id)

    async def create_user(
        self, user_data: CreateStudentRequest | CreateProfessorRequest
    ) -> StudentResponse | ProfessorResponse:
        
        if self.repository.find_by_email(user_data.email):
            raise UserAlreadyExistsError(user_data.email)
        
        user_dict = user_data.model_dump()
        user_dict["is_active"] = False 
        user_dict["password"] = None
        
        created_user = self.repository.create_user(user_dict)

        # activation token
        activation_token = create_activation_token(user_data.email)
        self.repository.set_activation_token(user_data.email, activation_token)

        await send_activation_email(user_data.email, activation_token)

        if created_user["role"] == "student":
            return self._to_student_response(created_user)
        
        return self._to_professor_reponse(created_user)
    
    def get_students(self, filters: StudentFiltersParams) -> list[StudentResponse]:
        students = self.repository.get_students(filters.model_dump(exclude_none=True))
        return [self._to_student_response(student) for student in students]

    def get_professors(self, filters: ProfessorFiltersParams) -> list[ProfessorResponse]:
        professors = self.repository.get_professors(filters.model_dump(exclude_none=True))
        return [self._to_professor_reponse(professor) for professor in professors]

    def delete_user(self, user_id: str):
        self._validate_user_id(user_id)
        deleted_user = self.repository.delete_user(user_id)

        if not deleted_user:
            raise UserNotFoundError(user_id)

    def update_student(self, user_id: str, user_data: UpdateStudentRequest) -> StudentResponse:
        self._validate_user_id(user_id)
        student = self.repository.find_by_id(user_id)

        if not student:
            raise UserNotFoundError(user_id)

        update_data = user_data.model_dump(exclude_unset=True)

        if not update_data:
            raise ValueError("No fields were provided for update.")
        
        new_email = update_data.get("email")
        if new_email and new_email != student["email"]:
            if self.repository.find_by_email(new_email):
                raise UserAlreadyExistsError(new_email)

        self.repository.update_user_by_id(user_id, update_data)

        updated_student = self.repository.find_by_id(user_id)

        return self._to_student_response(updated_student)
    
    def update_professor(self, user_id: str, user_data: UpdateProfessorRequest) -> ProfessorResponse:
        self._validate_user_id(user_id)
        professor = self.repository.find_by_id(user_id)

        if not professor:
            raise UserNotFoundError(user_id)
        
        update_data = user_data.model_dump(exclude_unset=True)

        if not update_data:
            raise ValueError("No fields were provided for update.")
        
        new_email = update_data.get("email")
        if new_email and new_email != professor["email"]:
            if self.repository.find_by_email(new_email):
                raise UserAlreadyExistsError(new_email)

        self.repository.update_user_by_id(user_id, update_data)

        updated_professor = self.repository.find_by_id(user_id)
        
        return self._to_professor_response(updated_professor)
        
