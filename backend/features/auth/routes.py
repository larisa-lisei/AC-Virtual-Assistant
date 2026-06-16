from fastapi import APIRouter, Depends, HTTPException, status, Response
from .schemas import ActivateAccountRequest, LoginRequest, CurrentUser
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
from .utils import ACCESS_TOKEN_EXPIRE_MINUTES


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
    except (InvalidActivationTokenError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except (AccountAlreadyActiveError) as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
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
)
def login(
    request: LoginRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        token, role = auth_service.login(request.email, request.password)
        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )

        return {
            "message": "Login successful",
            "role": role
        }
    except (InvalidCredentialsError, UserNotActiveError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    
@router.get(
    "/me",
    status_code=status.HTTP_200_OK
)
def get_current_user_info(
    current_user: CurrentUser = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }
    
@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT
)
def logout(
    response: Response,
    current_user: CurrentUser = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    auth_service.logout(current_user.token, current_user.exp)
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False
    )