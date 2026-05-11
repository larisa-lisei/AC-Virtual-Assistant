from datetime import datetime, timezone

from db.mongo import db

class FeedbackRepository:
    def __init__(self):
        self.collection = db["student_question_logs"]
        self.collection.create_index("course_id")
        self.collection.create_index("created_at")

    def save_question_log(self, course_id, course_name, question, answer_status, answer_preview):
        document = {
            "course_id": course_id,
            "course_name": course_name,
            "question": question,
            "answer_status": answer_status,
            "answer_preview": answer_preview,
            "created_at": datetime.now(timezone.utc)
        }

        result = self.collection.insert_one(document)
        return str(result.inserted_id)
    
    def get_questions_for_course(self, course_id: str, limit: int = 100) -> list[dict]:
        return list(
            self.collection.find(
                {"course_id": course_id}
            ).sort("created_at", -1).limit(limit)
        )
