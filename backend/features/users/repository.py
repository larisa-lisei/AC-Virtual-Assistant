from bson import ObjectId
from enum import Enum
from db.mongo import db
from .enums import UserRole
import re

class UserRepository:
    def __init__(self):
        self.users_collection = db["users"]

    def find_by_id(self, user_id: str):
        return self.users_collection.find_one({"_id": ObjectId(user_id)})

    def find_by_email(self, email: str):
        return self.users_collection.find_one({"email": email})

    def create_user(self, user_data: dict):
        result = self.users_collection.insert_one(user_data)
        created_user =  self.users_collection.find_one({"_id": result.inserted_id})
        return created_user

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
    
    def _build_query(self, role: UserRole, filters: dict, matching_course_ids: list[str] | None = None) -> dict:
        query = {"role": role.value}
        search = filters.pop("search", None)

        for key, value in filters.items():
            if value is None:
                continue 

            # convert enums to string values
            if isinstance(value, Enum):
                value = value.value

            query[key] = value

        # partial match, case-insensitive
        if search:
            if role == UserRole.student:
                query["$or"] = [
                    {
                        "email": {
                            "$regex": re.escape(search),
                            "$options": "i"
                        }
                    },
                    {
                        "group": {
                            "$regex": re.escape(search),
                            "$options": "i"
                        }
                    }
                ]
            elif role == UserRole.professor:
                query["$or"] = [
                    {
                        "email": {
                            "$regex": re.escape(search),
                            "$options": "i"
                        }
                    }
                ]

                if matching_course_ids:
                    query["$or"].append({
                        "course_ids": {
                            "$in": matching_course_ids
                        }
                    })
        
        return query
    
    def get_students(self, filters: dict) -> list:
        query = self._build_query(
            role=UserRole.student,
            filters=filters
        )
        return list(self.users_collection.find(query))
    
    def get_professors(self, filters: dict, matching_course_ids: list[str] | None = None) -> list:
        query = self._build_query(
            role=UserRole.professor,
            filters=filters,
            matching_course_ids=matching_course_ids
        )
        return list(self.users_collection.find(query))
    
    
    def delete_user(self, user_id: str) -> bool:
        result = self.users_collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
    
    def remove_course_from_professors(self, course_id: str):
        result = self.users_collection.update_many(
            {
                "role": "professor",
                "course_ids": course_id
            },
            {
                "$pull": {
                    "course_ids": course_id
                }
            }
        )
        return result.modified_count
    
    def update_user_by_id(self, user_id: str, updated_fields: dict) -> bool:
        result = self.users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updated_fields}
        )
        return result.matched_count > 0
