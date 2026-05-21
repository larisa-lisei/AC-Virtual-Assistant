from bson import ObjectId
from bson.errors import InvalidId

from .schemas import (
    CreateStudentRequest, 
    CreateProfessorRequest,
    StudentResponse,
    ProfessorResponse,
    UpdateStudentRequest,
    UpdateProfessorRequest,
    StudentFiltersParams,
    ProfessorFiltersParams,
    UserRole
)

from .exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError,
    InvalidUserIdError,
    CourseNotFoundError,
    NoUpdateFieldsProvidedError
)

from features.auth.utils import create_activation_token
from features.auth.email import send_activation_email

class UserService:
    def __init__(self, user_repository):
        self.repository = user_repository

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
            program=user["program"],
            course_ids=user.get("course_ids", [])
        )
    
    def _validate_user_id(self, user_id: str):
        try:
            ObjectId(user_id)
        except InvalidId:
            raise InvalidUserIdError(user_id)
        
    async def _create_base_user(self, email: str, user_dict: dict) -> dict:
        if self.repository.find_by_email(email):
            raise UserAlreadyExistsError(email)
        
        user_dict["is_active"] = False 
        user_dict["password"] = None

        created_user = self.repository.create_user(user_dict)

        # activation token
        activation_token = create_activation_token(email)
        self.repository.set_activation_token(email, activation_token)

        await send_activation_email(email, activation_token)

        return created_user
    
    async def create_student(self, user_data: CreateStudentRequest) -> StudentResponse:
        user_dict = user_data.model_dump()
        user_dict["role"] = UserRole.student
        created_user = await self._create_base_user(user_data.email, user_dict)
        return self._to_student_response(created_user)

    async def create_professor(self, user_data: CreateProfessorRequest) -> ProfessorResponse: 
        user_dict = user_data.model_dump(exclude={"existing_course_ids", "new_course"})
        user_dict["role"] = UserRole.professor

        course_ids = []

        # verify correct ids for existing courses
        if user_data.existing_course_ids:
            courses = self.repository.find_courses_by_ids(user_data.existing_course_ids)

            if len(courses) != len(user_data.existing_course_ids):
                found_ids = {str(course["_id"]) for course in courses}

                missing_ids = [course_id for course_id in user_data.existing_course_ids if course_id not in found_ids]

                raise CourseNotFoundError(missing_ids)

            course_ids.extend(user_data.existing_course_ids)

        if user_data.new_course:
            new_course_dict = user_data.new_course.model_dump()

            # verify course doesn't already exist
            existing_course = self.repository.find_course_by_details(new_course_dict)

            if existing_course:
                course_ids.append(str(existing_course["_id"]))
            else:
                created_course = self.repository.create_course(new_course_dict)
                course_ids.append(str(created_course["_id"]))

        user_dict["course_ids"] = course_ids
        
        created_user = await self._create_base_user(user_data.email, user_dict)
        
        return self._to_professor_response(created_user)
    
    def get_students(self, filters: StudentFiltersParams) -> list[StudentResponse]:
        students = self.repository.get_students(filters.model_dump(exclude_none=True))
        return [self._to_student_response(student) for student in students]

    def get_professors(self, filters: ProfessorFiltersParams) -> list[ProfessorResponse]:
        professors = self.repository.get_professors(filters.model_dump(exclude_none=True))
        return [self._to_professor_response(professor) for professor in professors]

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
                raise NoUpdateFieldsProvidedError(new_email)

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
            raise NoUpdateFieldsProvidedError("No fields were provided for update.")
        
        new_email = update_data.get("email")
        if new_email and new_email != professor["email"]:
            if self.repository.find_by_email(new_email):
                raise UserAlreadyExistsError(new_email)

        self.repository.update_user_by_id(user_id, update_data)

        updated_professor = self.repository.find_by_id(user_id)
        
        return self._to_professor_response(updated_professor)
        
