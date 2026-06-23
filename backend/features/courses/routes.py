from fastapi import APIRouter, Depends, HTTPException, status

from features.auth.dependencies import require_role
from features.auth.schemas import CurrentUser
from features.users.schemas import ProgramType
from features.users.enums import UserRole
from db.exceptions import InvalidIdError

from .dependencies import get_course_service
from .service import CourseService
from .schemas import CourseResponse, CourseHintsSettings
from .exceptions import CourseNotFoundError, CourseAccessDeniedError

router = APIRouter(prefix="/api/courses")

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
    current_user: CurrentUser = Depends(require_role(UserRole.professor)),
    course_service: CourseService = Depends(get_course_service)
):
    return course_service.get_courses_professor(current_user)
    
@router.get(
    "/learning",
    response_model=list[CourseResponse],
    status_code=status.HTTP_200_OK
)
def get_learning_courses(
    current_user: CurrentUser = Depends(require_role(UserRole.student)),
    course_service: CourseService = Depends(get_course_service)
):
    return course_service.get_courses_student(current_user)

@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_course(
    course_id: str,
    current_user: CurrentUser = Depends(require_role(UserRole.admin)),
    course_service: CourseService = Depends(get_course_service)
):
    try:
        course_service.delete_course(
            course_id=course_id,
            current_user=current_user
        )
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
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )

@router.patch(
    "/{course_id}/hints-only",
    status_code=status.HTTP_204_NO_CONTENT 
)
def update_hints_only(
    course_id: str,
    request: CourseHintsSettings,
    current_user: CurrentUser = Depends(require_role(UserRole.professor)),
    course_service: CourseService = Depends(get_course_service)
):
    try:
        course_service.update_hints_only(
            course_id=course_id,
            hints_only=request.hints_only,
            current_user=current_user
        )
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
    except CourseAccessDeniedError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )