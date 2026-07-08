from fastapi import Depends, Request
from jose import JWTError
from fastapi import HTTPException, status
from fastapi.security import APIKeyCookie

from features.users.repository import UserRepository

from features.auth.utils import decode_token
from .repository import AuthRepository
from .schemas import CurrentUser

access_token_cookie = APIKeyCookie(
    name="access_token",
    auto_error=False
)

def get_auth_repository() -> AuthRepository:
    return AuthRepository()

def get_user_repository() -> UserRepository:
    return UserRepository()

def get_current_user(
    token: str | None = Depends(access_token_cookie),
    auth_repo: AuthRepository = Depends(get_auth_repository),
    user_repo: UserRepository = Depends(get_user_repository)
) -> CurrentUser:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenicated."
        )
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
        email = payload["email"]
        exp = payload["exp"]
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )
    
    if auth_repo.is_token_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been invalidated."
        )
    
    user = user_repo.find_by_id(payload["sub"])
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User account no longer exists.")

    return CurrentUser(
        id=user_id,
        email=email,
        role=user["role"],
        token=token,
        exp=exp
    )

def require_role(*roles: str):
    def guard(current_user: CurrentUser = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied."
            )
        return current_user
    return guard