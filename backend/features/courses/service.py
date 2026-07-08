from db.utils import validate_id

from features.auth.schemas import CurrentUser
from features.users.repository import UserRepository
from features.users.schemas import ProgramType
from features.courses.exceptions import CourseAccessDeniedError

from .repository import CourseRepository
from .exceptions import CourseNotFoundError
from .schemas import CreateCourseRequest, CourseResponse

class CourseService:
    def __init__(
        self,
        course_repository: CourseRepository,
        user_repository: UserRepository
    ):
        self.repository = course_repository
        self.user_repository = user_repository

    def _to_course_response(self, course: dict) -> CourseResponse:
        return CourseResponse(
            id=str(course["_id"]),
            name=course["name"],
            degree=course["degree"],
            program=course["program"],
            year=course["year"],
            specialization=course.get("specialization"),
            hints_only=course.get("hints_only", False)
        )

    def get_course_by_id(self, course_id: str):
        validate_id(course_id)
        course = self.repository.find_course_by_id(course_id)
        if not course:
            raise CourseNotFoundError([course_id])
        return course

    def get_courses_by_id(self, course_ids: list[str]) -> list[dict]:
        return self.repository.find_courses_by_id(course_ids)
    
    def find_course_ids_by_name(self, search: str) -> list[str]:
        return self.repository.find_course_ids_by_name(search)
    
    def get_course_ids_for_professor(self, existing_course_ids: list[str], new_course: CreateCourseRequest | None) -> list[str]:
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
    
    def get_courses_admin(
        self,
        program: ProgramType | None = None
    ) ->list[CourseResponse]:
        courses = self.repository.get_courses_admin(program)

        return [
            self._to_course_response(course)
            for course in courses
        ]
    
    def get_courses_professor(self, current_user: CurrentUser) -> list[CourseResponse]:
        professor = self.user_repository.find_by_id(current_user.id)
        courses = self.repository.find_courses_by_id(
            professor.get("course_ids", [])
        )
        return [
            self._to_course_response(course)
            for course in courses
        ]
    
    def ensure_professor_can_manage_course(self, current_user: CurrentUser, course_id: str):
        course = self.get_course_by_id(course_id)

        professor = self.user_repository.find_by_id(current_user.id)
        professor_course_ids = [
            str(professor_course_id)
            for professor_course_id in professor.get("course_ids", [])
        ]
        if course_id not in professor_course_ids:
            raise CourseAccessDeniedError()
        return course
        
    def ensure_student_can_access_course(self, current_user: CurrentUser, course_id: str):
        validate_id(course_id)
        course = self.get_course_by_id(course_id)
        if not course:
            raise CourseNotFoundError([course_id])

        student = self.user_repository.find_by_id(current_user.id)

        if student["degree"] != course["degree"] or student["program"] != course["program"] or student["year"] != course["year"]:
            raise CourseAccessDeniedError()
        
        course_specialization = course.get("specialization")
        student_specialization = student.get("specialization")

        if course_specialization and course_specialization != student_specialization:
            raise CourseAccessDeniedError()
        
        return course
    
    def get_courses_student(self, current_user: CurrentUser) -> list[CourseResponse]:
        student = self.user_repository.find_by_id(current_user.id)
        
        courses = self.repository.get_courses_student(
            program=student["program"],
            degree=student["degree"],
            year=student["year"],
            specialization=student.get("specialization")
        )

        return [
            self._to_course_response(course)
            for course in courses
        ]
    
    def delete_course(self, course_id):
        course = self.get_course_by_id(course_id)
      
        self.user_repository.remove_course_from_professors(course["_id"])
        self.repository.delete_course_by_id(course["_id"])

    def update_hints_only(self, course_id, hints_only: bool, current_user):
        course = self.ensure_professor_can_manage_course(
            current_user=current_user,
            course_id=course_id
        )
        
        self.repository.update_hints_only(
            course_id=course["_id"],
            hints_only=hints_only
        )
