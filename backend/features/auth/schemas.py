from pydantic import BaseModel, EmailStr, Field
from features.users.enums import UserRole

class ActivateAccountRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
