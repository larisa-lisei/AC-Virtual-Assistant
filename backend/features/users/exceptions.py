class UserAlreadyExistsError(Exception):
    def __init__(self, email: str):
        self.email = email

class UserNotFoundError(Exception):
    def __init__(self, email: str):
        self.email = email