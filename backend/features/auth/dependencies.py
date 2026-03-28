from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from fastapi import HTTPException, status

from features.users.repository import UserRepository
from features.auth.utils import decode_token
from .repository import AuthRepository


bearer = HTTPBearer()

def get_auth_repository() -> AuthRepository:
    return AuthRepository()

def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(bearer),
        auth_repo: AuthRepository = Depends(get_auth_repository)
) -> dict:
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token."
        )
    
    if auth_repo.is_token_blacklisted(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been invalidated."
        )

    return {
        "email": payload["sub"], 
        "role": payload["role"],
        "token": credentials.credentials,
        "exp": payload["exp"]
    }

def require_role(*roles: str):
    def guard(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied."
            )
        return current_user
    return guard