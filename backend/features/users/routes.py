from fastapi import APIRouter, Depends, HTTPException, status
from .schemas import (
    CreateStudentRequest, 
    StudentResponse,
    CreateProfessorRequest,
    ProfessorResponse,
    UpdateStudentRequest,
    UpdateProfessorRequest,
    StudentFiltersParams,
    ProfessorFiltersParams
)
from .service import UserService
from .repository import UserRepository
from .exceptions import (
    UserAlreadyExistsError,
    UserNotFoundError,
    InvalidUserIdError,
    CourseNotFoundError
)

router = APIRouter(prefix="/api/users")

def get_user_service() -> UserService:
    return UserService(UserRepository())

@router.post(
    "/add-account/student",
    status_code=status.HTTP_201_CREATED,
    response_model=StudentResponse
)
async def create_student(
    user_data: CreateStudentRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return await user_service.create_student(user_data)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {e.email} already exists."
        )
    
@router.post(
    "/add-account/professor",
    status_code=status.HTTP_201_CREATED,
    response_model=ProfessorResponse
)
async def create_professor(
    user_data: CreateProfessorRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return await user_service.create_professor(user_data)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {e.email} already exists."
        )
    except CourseNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Courses with ids {e.course_ids} not found."
        )
    
@router.get(
    "/students",
    response_model=list[StudentResponse]
)
def get_students(
    filters: StudentFiltersParams = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_students(filters)

@router.get(
    "/professors",
    response_model=list[ProfessorResponse]
)
def get_professors(
    filters: ProfessorFiltersParams = Depends(),
    user_service: UserService = Depends(get_user_service)
):
    return user_service.get_professors(filters)
    
@router.delete(
    "/{user_email}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.delete_user(user_id)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {e.user} not found."
        )
    except InvalidUserIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid user id: {e.id}"
        )
    
@router.patch(
    "/students/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def update_student(
    user_id: str,
    student_data: UpdateStudentRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.update_student(user_id, student_data)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {e.user} not found."
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student with email {e.email} already exists."
        )
    except InvalidUserIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid user id: {e.id}"
        )
    
@router.patch(
    "/professors/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def update_professor(
    user_id: str,
    professor_data: UpdateProfessorRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.update_professor(user_id, professor_data)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prfessor with id {e.user} not found."
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Professor with email {e.email} already exists."
        )
    except InvalidUserIdError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Invalid user id: {e.id}"
        )
        