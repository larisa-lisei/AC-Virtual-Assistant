import bcrypt
from datetime import datetime, timezone, timedelta
from jose import jwt

from core.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
ACTIVATION_TOKEN_EXPIRE_HOURS = settings.ACTIVATION_TOKEN_EXPIRE_HOURS

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')

    hashed_password = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()) 
    return hashed_password.decode('utf-8')

def verify_password(plain_pwd: str, hashed_pwd: str) -> bool:
    return bcrypt.checkpw(plain_pwd.encode('utf-8'), hashed_pwd.encode('utf-8'))

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, SECRET_KEY, ALGORITHM)

def create_activation_token(email: str) -> str:
    payload = {
        "sub": email,
        "type": "activation",
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACTIVATION_TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

