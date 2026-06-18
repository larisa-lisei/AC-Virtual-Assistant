from .service import CourseService
from .repository import CourseRepository
from features.users.repository import UserRepository

def get_course_service() -> CourseService:
    return CourseService(
        CourseRepository(),
        UserRepository()
    )