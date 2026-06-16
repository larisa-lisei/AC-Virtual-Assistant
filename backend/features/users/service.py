from bson import ObjectId
from bson.errors import InvalidId

from .schemas import (
    CreateCourseRequest,
    CreateStudentRequest, 
    CreateProfessorRequest,
    StudentResponse,
    ProfessorResponse,
    CourseResponse,
    UpdateStudentRequest,
    UpdateProfessorRequest,
    StudentFiltersParams,
    ProfessorFiltersParams,
    UserRole
)

from .exceptions import (
    DuplicatedValueError,
    UserAlreadyExistsError,
    UserNotFoundError,
    InvalidIdError,
    CourseNotFoundError,
    NoUpdateFieldsProvidedError
)

from .enums import ProgramType

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
            group=user["group"],
            is_active=user["is_active"]
        )
    
    def _to_professor_response(self, user: dict) -> ProfessorResponse:
        courses = self.repository.find_courses_by_id(user.get("course_ids", []))
        return ProfessorResponse(
            id=str(user["_id"]),
            email=user["email"],
            role=user["role"],
            program=user["program"],
            course_ids=[str(course["_id"]) for course in courses],
            course_names=[course["name"] for course in courses],
            is_active=user["is_active"]
        )
        
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
    
    def _get_course_ids_for_professor(self, existing_course_ids: list[str], new_course: CreateCourseRequest | None) -> list[str]:
        course_ids = []

        # Existing selected courses
        if existing_course_ids:
            courses = self.repository.find_courses_by_id(existing_course_ids)

            if len(courses) != len(existing_course_ids):
                found_ids = {str(course["_id"]) for course in courses}
                missing_ids = [course_id for course_id in existing_course_ids if course_id not in found_ids]

                raise CourseNotFoundError(missing_ids)
            
            course_ids.extend(existing_course_ids)

        # New course, if provided
        if new_course:
            new_course_dict = new_course.model_dump()
            existing_course = self.repository.find_course_by_details(new_course_dict)

            if existing_course:
                course_ids.append(str(existing_course["_id"]))
            else:
                created_course = self.repository.create_course(new_course_dict)
                course_ids.append(str(created_course["_id"]))

        return course_ids
    
    async def create_student(self, user_data: CreateStudentRequest) -> StudentResponse:
        user_dict = user_data.model_dump()
        user_dict["role"] = UserRole.student
        created_user = await self._create_base_user(user_data.email, user_dict)
        return self._to_student_response(created_user)

    async def create_professor(self, user_data: CreateProfessorRequest) -> ProfessorResponse: 
        user_dict = user_data.model_dump(exclude={"existing_course_ids", "new_course"})
        user_dict["role"] = UserRole.professor


        user_dict["course_ids"] = self._get_course_ids_for_professor(
            user_data.existing_course_ids,
            user_data.new_course
        )
        
        created_user = await self._create_base_user(user_data.email, user_dict)
        
        return self._to_professor_response(created_user)
    
    def get_students(self, filters: StudentFiltersParams) -> list[StudentResponse]:
        students = self.repository.get_students(filters.model_dump(exclude_none=True))
        return [self._to_student_response(student) for student in students]

    def get_professors(self, filters: ProfessorFiltersParams) -> list[ProfessorResponse]:
        professors = self.repository.get_professors(filters.model_dump(exclude_none=True))
        return [self._to_professor_response(professor) for professor in professors]
    
    def get_courses(self, program: ProgramType | None = None):
        courses = self.repository.get_courses(program)
        return [CourseResponse(
            id=str(course["_id"]),
            name=course["name"],
            degree=course["degree"],
            program=course["program"],
            year=course["year"],
            specialization=course.get("specialization")
        ) for course in courses]

    def delete_user(self, user_id: str):
        self._validate_id(user_id)
        user = self.repository.find_by_id(user_id)
        if not user:
            raise UserNotFoundError(user_id)
        
        self.repository.delete_user(user_id)
        
    def delete_course(self, course_id: str):
        self._validate_id(course_id)
        course = self.repository.find_courses_by_id([course_id])
        if not course:
            raise CourseNotFoundError([course_id])
        self.repository.remove_course_from_professors(course_id)
        self.repository.delete_course_by_id(course_id)
        
    def _validate_id(self, id: str):
        try:
            ObjectId(id)
        except InvalidId:
            raise InvalidIdError(id)

    def update_student(self, user_id: str, user_data: UpdateStudentRequest) -> StudentResponse:
        self._validate_id(user_id)
        student = self.repository.find_by_id(user_id)

        if not student:
            raise UserNotFoundError(user_id)

        update_data = user_data.model_dump(exclude_unset=True)

        if not update_data:
            raise NoUpdateFieldsProvidedError()

        self.repository.update_user_by_id(user_id, update_data)

        updated_student = self.repository.find_by_id(user_id)

        return self._to_student_response(updated_student)
    
    def update_professor(self, user_id: str, user_data: UpdateProfessorRequest) -> ProfessorResponse:
        self._validate_id(user_id)
        professor = self.repository.find_by_id(user_id)

        if not professor:
            raise UserNotFoundError(user_id)
        
        update_data = user_data.model_dump(exclude_unset=True)

        if not update_data:
            raise NoUpdateFieldsProvidedError("No fields were provided for update.")
        
        course_ids = self._get_course_ids_for_professor(
            user_data.existing_course_ids,
            user_data.new_course
        )

        self.repository.update_user_by_id(user_id, {"course_ids": course_ids})

        updated_professor = self.repository.find_by_id(user_id)
        
        return self._to_professor_response(updated_professor)
        
