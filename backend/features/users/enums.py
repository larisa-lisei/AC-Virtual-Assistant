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

class BachelorSpecialization(str, Enum):
    cs = "Computer Science"
    it = "Information Technology"

class MasterCSITSpecialization(str, Enum):
    ai = "Artificial Intelligence"
    ec = "Embedded Computers"
    dswt = "Distributed Systems and Web Technologies"
    cs = "Cyberspace Security"

class MasterSESpecialization(str, Enum):
    mlrc = "Machine Learning, Robotics and Control"
    ecs = "Embedded Control Systems"