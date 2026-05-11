from enum import Enum

class UserRole(str, Enum):
    student = "student"
    professor = "professor"
    admin = "admin"

class DegreeType(str, Enum):
    bachelor = "bachelor"
    master = "master"

class ProgramType(str, Enum):
    csit = "Computer Science and Information Technology"
    se = "Software Engineering"