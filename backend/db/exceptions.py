class InvalidIdError(Exception):
    def __init__(self, id: str):
        self.id = id
