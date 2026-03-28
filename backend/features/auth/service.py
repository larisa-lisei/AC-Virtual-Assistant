from jose import JWTError

from features.users.repository import UserRepository
from .utils import (
    decode_token, 
    hash_password, 
    verify_password,
    create_access_token
)

from features.users.exceptions import (
    UserNotFoundError, 
    InvalidActivationTokenError, 
    InvalidCredentialsError,
    UserNotActiveError,
    AccountAlreadyActiveError
)

class AuthService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def activate_account(self, token: str, password: str):
        activation_token = self.repository.find_by_activation_token(token)

        if not activation_token:
            raise InvalidActivationTokenError()

        try:
            payload = decode_token(token)
        except JWTError:
            raise InvalidActivationTokenError()
        
        if payload.get('type') != 'activation':
            raise InvalidActivationTokenError()
        
        email = payload.get('sub')
        user = self.repository.find_by_email(email)

        if not user:
            raise UserNotFoundError(email)
        
        if user.get('is_active'):
            raise AccountAlreadyActiveError()
        
        hashed_password = hash_password(password)
        self.repository.activate_user(email, hashed_password)

    def login(self, email: str, password: str):
        user = self.repository.find_by_email(email)

        if not user:
            raise InvalidCredentialsError()
        if not user.get('is_active'):
            raise UserNotActiveError(email)
        if not verify_password(password, user['password']):
            raise InvalidCredentialsError()
        
        token = create_access_token({'sub': user['email'], 'role': user['role']}) 
        return token, user['role']