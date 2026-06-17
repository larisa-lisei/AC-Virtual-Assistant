from fastapi import APIRouter, Depends, HTTPException, status

from features.auth.dependencies import require_role
from features.auth.schemas import CurrentUser
from features.users.repository import UserRepository
from features.users.schemas import ProgramType
from features.users.exceptions import InvalidIdError

from .repository import CourseRepository
from .service import CourseService
from .schemas import CourseResponse
from .exceptions import CourseNotFoundError

router = APIRouter(prefix="/api/courses")


def get_course_service() -> CourseService:
    return CourseService(
        CourseRepository(),
        UserRepository()
    )

@router.get(
    "",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK
)
def get_courses(
    program: ProgramType | None = None,
    course_service: CourseService = Depends(get_course_service)
):
    return course_service.get_courses_admin(program)

@router.get(
    "/teaching",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK
)
def get_teaching_courses(
    current_user: CurrentUser = Depends(require_role("professor")),
    course_service: CourseService = Depends(get_course_service)
):
    return course_service.get_courses_professor(current_user)
    
@router.get(
    "/learning",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK
)
def get_learning_courses(
    current_user: CurrentUser = Depends(require_role("student")),
    course_service: CourseService = Depends(get_course_service)
):
    return course_service.get_courses_student(current_user)

@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_course(
    course_id: str,
    current_user: CurrentUser = Depends(require_role("admin")),
    course_service: CourseService = Depends(get_course_service)
):
    try:
        course_service.delete_course(course_id)
    except InvalidIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid course id: {e.id}"
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {e.course_ids[0]} not found."
        )
        