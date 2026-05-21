from features.auth.utils import hash_password
from features.users.enums import (
    UserRole,
    DegreeType,
    ProgramType,
    BachelorSpecialization,
    MasterCSITSpecialization,
    MasterSESpecialization
)

from db.mongo import db


users_collection = db["users"]
courses_collection = db["courses"]


def get_or_create_course(course_data: dict):

    existing_course = courses_collection.find_one(course_data)

    if existing_course:
        return existing_course

    result = courses_collection.insert_one(course_data)

    return courses_collection.find_one({
        "_id": result.inserted_id
    })


def create_mock_users():

    password = hash_password("Password123!")

    databases_course = get_or_create_course({
        "name": "Databases",
        "degree": DegreeType.bachelor,
        "program": ProgramType.csit,
        "year": 3    
    })

    ai_course = get_or_create_course({
        "name": "Artificial Intelligence",
        "degree": DegreeType.bachelor,
        "program": ProgramType.csit,
        "year": 4    
    })
    
    ml_course = get_or_create_course({
        "name": "Machine Learning",
        "degree": DegreeType.bachelor,
        "program": ProgramType.csit,
        "year": 4,
        "specialization": BachelorSpecialization.it    
    })

    mock_users = [
        # students
        {
            "email": "student1@test.com",
            "role": UserRole.student,
            "degree": DegreeType.bachelor,
            "program": ProgramType.csit,
            "year": 3,
            "group": "1308A",
            "password": password,
            "is_active": True
        },

        {
            "email": "student2@test.com",
            "role": UserRole.student,
            "degree": DegreeType.bachelor,
            "program": ProgramType.csit,
            "year": 4,
            "specialization": BachelorSpecialization.it,
            "group": "342",
            "password": password,
            "is_active": True
        },

        {
            "email": "student3@test.com",
            "role": UserRole.student,
            "degree": DegreeType.master,
            "program": ProgramType.se,
            "year": 1,
            "specialization": MasterSESpecialization.mlrc,
            "group": "MLRC-1A",
            "password": password,
            "is_active": True
        },

        # professors
        {
            "email": "professor1@test.com",
            "role": UserRole.professor,
            "program": ProgramType.csit,
            "course_ids": [
                str(databases_course["_id"])
            ],
            "password": password,
            "is_active": True
        },

        {
            "email": "professor2@test.com",
            "role": UserRole.professor,
            "program": ProgramType.csit,
            "course_ids": [
                str(ai_course["_id"])
            ],
            "password": password,
            "is_active": True
        },

        {
            "email": "professor3@test.com",
            "role": UserRole.professor,
            "program": ProgramType.csit,
            "course_ids": [
                str(ai_course["_id"]),
                str(ml_course["_id"])
            ],
            "password": password,
            "is_active": True
        },

        {
            "email": "professor4@test.com",
            "role": UserRole.professor,
            "program": ProgramType.se,
            "course_ids": [
                str(ml_course["_id"]),
            ],
            "password": password,
            "is_active": True
        }
    ]

    for user in mock_users:

        existing_user = users_collection.find_one({
            "email": user["email"]
        })

        if existing_user:
            print(f"User already exists: {user['email']}")
            continue

        users_collection.insert_one(user)

        print(f"Created user: {user['email']}")


if __name__ == "__main__":
    create_mock_users()