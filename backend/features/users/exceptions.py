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
    
class NoUpdateFieldsProvidedError(Exception):
    def __str__(self):
        return "No fields provided for update."
    
class DuplicatedValueError(Exception):
    def __init__(self, field: str, value: str):
        self.field = field
        self.value = value
