from bson import ObjectId

from db.mongo import db
from features.users.enums import (
    ProgramType,
    DegreeType,
    BachelorSpecialization,
    MasterCSITSpecialization,
    MasterSESpecialization
)
import re

class CourseRepository:
    def __init__(self):
        self.courses_collection = db["courses"]

    def create_course(self, course_data: dict):
        result = self.courses_collection.insert_one(course_data)
        return self.courses_collection.find_one({"_id": result.inserted_id})
    
    def find_course_by_id(self, course_id: str):
        return self.courses_collection.find_one({"_id": ObjectId(course_id)})
    
    def find_courses_by_id(self, course_ids: list[str]):
        if not course_ids:
            return []
        object_ids = [ObjectId(course_id) for course_id in course_ids]
        return list(
            self.courses_collection.find({
                "_id": {"$in": object_ids}
            })
        )
    
    # professor search
    def find_course_ids_by_name(self, search: str) -> list[str]:
        courses = list(
            self.courses_collection.find({
                "name": {
                    "$regex": re.escape(search),
                    "$options": "i"
                }
            })
        )
        return [
            str(course["_id"])
            for course in courses
        ]
    
    def find_course_by_details(self, course_data: dict):
        return self.courses_collection.find_one({
            "name": course_data["name"],
            "degree": course_data["degree"],
            "program": course_data["program"],
            "year": course_data["year"],
            "specialization": course_data.get("specialization")
        })
    
    def get_courses_admin(self, program: ProgramType | None = None) -> list:
        query = {}
        if program:
            query["program"] = program.value
        return list(self.courses_collection.find(query))
    
    def get_courses_student(self, program: ProgramType, degree: DegreeType, year, specialization: BachelorSpecialization | MasterCSITSpecialization | MasterSESpecialization) -> list:
        query = {
            "program": program,
            "degree": degree,
            "year": year
        }

        if specialization:
            query["$or"] = [
                {"specialization": specialization},
                {"specialization": None},
                {"specialization": {"$exists": False}}
            ]
        else:
            query["$or"] = [
                {"specialization": None},
                {"specialization": {"$exists": False}}
            ]

        return list(self.courses_collection.find(query))
    
    def delete_course_by_id(self, course_id: str):
        result = self.courses_collection.delete_one({"_id": ObjectId(course_id)})
        return result.deleted_count > 0
    
    def update_hints_only(self, course_id, hints_only: bool):
        result = self.courses_collection.update_one(
            {"_id": course_id},
            {"$set": {"hints_only": hints_only}}
        )

        return result.matched_count > 0