from fastapi import APIRouter, Depends, HTTPException, status
from .schemas import ActivateAccountRequest, TokenResponse, LoginRequest
from .service import AuthService
from features.users.repository import UserRepository

from features.users.exceptions import (
    InvalidActivationTokenError,
    UserNotFoundError,
    AccountAlreadyActiveError,
    InvalidCredentialsError,
    UserNotActiveError
)

from .repository import AuthRepository
from .dependencies import get_current_user


router = APIRouter(prefix="/api/auth")

def get_auth_service() -> AuthService:
    return AuthService(UserRepository(), AuthRepository())

@router.post(
    "/activate-account",
    status_code=status.HTTP_204_NO_CONTENT,
)
def activate_account(
    request: ActivateAccountRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        auth_service.activate_account(request.token, request.password)
    except (InvalidActivationTokenError, AccountAlreadyActiveError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email {e.email} not found."
        )
    
@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    response_model=TokenResponse
)
def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        token, role = auth_service.login(request.email, request.password)
        return TokenResponse(access_token=token, role=role)
    except (InvalidCredentialsError, UserNotActiveError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT
)
def logout(
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    auth_service.logout(current_user["token"], current_user["exp"])