import re

from pydantic import BaseModel, EmailStr, Field, field_validator
from features.users.enums import UserRole

class ActivateAccountRequest(BaseModel):
    token: str
    password: str = Field(...)
    @field_validator('password')
    @classmethod
    def validate_password(cls, value):
        if len(value) < 8:
            raise ValueError("Password should have at least 8 characters.")
        
        if len(value) > 128:
            raise ValueError("Password should have at most 128 characters.")
        
        if not re.search(r"[A-Z]", value):
            raise ValueError("Password should contain at least one uppercase letter.")
        
        if not re.search(r"[a-z]", value):
            raise ValueError("Password should contain at least one lowercase letter.")
        
        if not re.search(r"\d", value):
            raise ValueError("Password should contain at least one digit.")
        
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise ValueError("Password should contain ar least one special character: [!@#$%^&*(),.?\":{}|<>]")

        return value

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CurrentUser(BaseModel):
    email: EmailStr
    role: UserRole
    token: str
    exp: int
