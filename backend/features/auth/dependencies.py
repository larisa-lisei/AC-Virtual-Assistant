from fastapi import Depends
from jose import JWTError
from fastapi import HTTPException, status
from fastapi.security import APIKeyCookie

from features.auth.utils import decode_token
from .repository import AuthRepository
from .schemas import CurrentUser

access_token_cookie = APIKeyCookie(
    name="access_token",
    auto_error=False
)

def get_auth_repository() -> AuthRepository:
    return AuthRepository()

def get_current_user(
        token: str | None = Depends(access_token_cookie),
        auth_repo: AuthRepository = Depends(get_auth_repository)
) -> CurrentUser:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenicated."
        )
    try:
        payload = decode_token(token)
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

    return CurrentUser(
        id=payload["sub"],
        email=payload["email"],
        role=payload["role"],
        token=token,
        exp=payload["exp"]
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