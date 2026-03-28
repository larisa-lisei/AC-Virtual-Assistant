class UserAlreadyExistsError(Exception):
    def __init__(self, email: str):
        self.email = email

class UserNotFoundError(Exception):
    def __init__(self, user: str):
        self.user = user

class AccountAlreadyActiveError(Exception):
    def __str__(self):
        return "Account is already active."

class InvalidActivationTokenError(Exception):
    def __str__(self):
        return "Invalid or expired activation token."

class InvalidCredentialsError(Exception):
    def __str__(self):
        return "Invalid email or password."

class UserNotActiveError(Exception):
    def __str__(self):
        return "Account is not activated."
    
class InvalidUserIdError(Exception):
    def __init__(self, id: str):
        self.id = id