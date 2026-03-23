from db.mongo import db
from .enums import UserRole
import re

class UserRepository:
    def __init__(self):
        self.collection = db["users"]

    def find_by_email(self, email: str):
        return self.collection.find_one({"email": email})

    def create_user(self, user_data: dict):
        result = self.collection.insert_one(user_data)
        created_user =  self.collection.find_one({"_id": result.inserted_id})
        return created_user
    
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
        return list(self.collection.find(query))
    
    def get_professors(self, filters: dict) -> list:
        query = self._build_query(
            role=UserRole.professor,
            filters=filters,
            partial_fields={"email"}
        )
        return list(self.collection.find(query))
    
    def delete_user(self, email: str) -> bool:
        result = self.collection.delete_one({"email": email})
        return result.deleted_count > 0
    
    def update_user_by_email(self, current_email: str, updated_fields: dict) -> bool:
        result = self.collection.update_one(
            {"email": current_email},
            {"$set": updated_fields}
        )
        return result.matched_count > 0
