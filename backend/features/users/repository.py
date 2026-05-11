from bson import ObjectId

from db.mongo import db
from .enums import UserRole
import re

class UserRepository:
    def __init__(self):
        self.users_collection = db["users"]
        self.courses_collection = db["courses"]

    def find_by_id(self, user_id: str):
        return self.users_collection.find_one({"_id": ObjectId(user_id)})

    def find_by_email(self, email: str):
        return self.users_collection.find_one({"email": email})

    def create_user(self, user_data: dict):
        result = self.users_collection.insert_one(user_data)
        created_user =  self.users_collection.find_one({"_id": result.inserted_id})
        return created_user
    
    def create_course(self, course_data: dict):
        result = self.courses_collection.insert_one(course_data)
        return self.courses_collection.find_one({"_id": result.inserted_id})
    
    def find_courses_by_id(self, course_ids: list[str]):
        object_ids = [ObjectId(course_ids) for course_id in course_ids]
        return list(
            self.courses_collection.find({
                "_id": {"$in": object_ids}
            })
        )
    
    def find_course_by_details(self, course_data: dict):
        return self.courses_collection.find_one({
            "name": course_data["name"],
            "degree": course_data["degree"],
            "program": course_data["program"],
            "year": course_data["year"],
            "specialization": course_data.get("specialization")
        })

    def find_by_activation_token(self, token: str):
        return self.users_collection.find_one({"activation_token": token})
    
    def activate_user(self, email: str, hashed_password: str) -> bool:
        result = self.users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "password": hashed_password,
                    "is_active": True
                },
                "$unset": {
                    "activation_token": ""
                }
            }
        )

        return result.modified_count > 0
    
    def set_activation_token(self, email: str, token: str) -> bool:
        result = self.users_collection.update_one(
                {"email": email},
                {"$set": {"activation_token": token, "is_active": False}}
        )
        return result.modified_count > 0
    
    def _build_query(self, role: str, filters: dict, partial_fields: set[str]) -> dict:
        query = {"role": role}

        for key, value in filters.items():
            if value is None:
                continue 

            # partial match, case-insensitive
            if key in partial_fields:
                query[key] = {
                    "$regex": re.escape(value),
                    "$options": "i"
                }
            else:
                query[key] = value

        return query
    
    def get_students(self, filters: dict) -> list:
        query = self._build_query(
            role=UserRole.student,
            filters=filters,
            partial_fields={"email", "group"}
        )
        return list(self.users_collection.find(query))
    
    def get_professors(self, filters: dict) -> list:
        query = self._build_query(
            role=UserRole.professor,
            filters=filters,
            partial_fields={"email"}
        )
        return list(self.users_collection.find(query))
    
    def delete_user(self, user_id: str) -> bool:
        result = self.users_collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    def update_user_by_id(self, user_id: str, updated_fields: dict) -> bool:
        result = self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updated_fields}
        )
        return result.matched_count > 0
