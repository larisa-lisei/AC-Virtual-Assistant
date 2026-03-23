from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from .schemas import (
    CreateUserRequest, 
    StudentResponse,
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
    UserNotFoundError
)
from .enums import DegreeType


router = APIRouter(prefix="/api/users")

def get_user_service() -> UserService:
    return UserService(UserRepository())

@router.post(
    "/add-account",
    status_code=status.HTTP_201_CREATED,
    response_model=StudentResponse | ProfessorResponse
)
def create_user(
    user_data: CreateUserRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.create_user(user_data)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User with email {e.email} already exists."
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
    user_email: str,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.delete_user(user_email)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {e.email} not found."
        )
    
@router.patch(
    "/students/{email}",
    status_code=status.HTTP_204_NO_CONTENT
)
def update_student(
    email: str,
    student_data: UpdateStudentRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.update_student(email, student_data)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with email {e.email} not found."
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Student with email {e.email} already exists."
        )
    
@router.patch(
    "/professors/{email}",
    status_code=status.HTTP_204_NO_CONTENT
)
def update_professor(
    email: str,
    professor_data: UpdateProfessorRequest,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return user_service.update_professor(email, professor_data)
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prfessor with email {e.email} not found."
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Professor with email {e.email} already exists."
        )
        