from datetime import datetime, timezone
from jose import JWTError

from .utils import (
    decode_token, 
    hash_password, 
    verify_password,
    create_access_token
)

from features.users.exceptions import (
    InvalidActivationTokenError, 
    InvalidCredentialsError,
    UserNotActiveError,
    AccountAlreadyActiveError
)

class AuthService:
    def __init__(self, user_repo, auth_repo):
        self.user_repo = user_repo
        self.auth_repo = auth_repo

    def activate_account(self, token: str, password: str):
        user = self.user_repo.find_by_activation_token(token)

        if not user:
            raise InvalidActivationTokenError()

        try:
            payload = decode_token(token)
        except JWTError:
            raise InvalidActivationTokenError()
        
        if payload.get('type') != 'activation':
            raise InvalidActivationTokenError()
        
        email = payload.get('sub')

        if not email or user["email"] != email:
            raise InvalidActivationTokenError()
        
        if user.get('is_active'):
            raise AccountAlreadyActiveError()
        
        hashed_password = hash_password(password)
        self.user_repo.activate_user(email, hashed_password)

    def login(self, email: str, password: str):
        user = self.user_repo.find_by_email(email)

        if not user:
            raise InvalidCredentialsError()
        if not user.get('is_active'):
            raise UserNotActiveError(email)
        if not verify_password(password, user['password']):
            raise InvalidCredentialsError()
        
        token = create_access_token({ 'sub': str(user['_id']), 'email': user['email'], 'role': user['role']}) 
        return token, user['role']
    
    def logout(self, token: str, exp: int):
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
        self.auth_repo.blacklist_token(token, expires_at)