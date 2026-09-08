from db.mongo import db
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import DESCENDING

from .enums import ConvRole, ConvType

class ConversationRepository:
    def __init__(self):
        self.history_collection = db["chat_history"]

    def create_conversation(self, user_id, course_id, course_name):
        now = datetime.now(timezone.utc)

        result = self.history_collection.insert_one({
            "user_id": user_id,
            "course_id": course_id,
            "course_name": course_name,
            "created_at": now,
            "updated_at": now,
            "messages": []
        })

        return str(result.inserted_id)
    
    def find_by_id(self, conversation_id):
        return self.history_collection.find_one({"_id": ObjectId(conversation_id)})
    
    def find_by_user_and_course(self, user_id, course_id, conversation_type: ConvType):
        return self.history_collection.find_one(
            {
                "user_id": user_id,
                "course_id": course_id,
                "conversation_type": conversation_type.value
            },
            sort=[("updated_at", DESCENDING)]
        )
    
    def append_message(self, conversation_id, sender: ConvRole, content, sources: list[dict] | None = None):
        now = datetime.now(timezone.utc)

        message = {
            "sender": sender.value,
            "content": content,
            "created_at": now
        }

        if sources:
            message["sources"] = sources

        self.history_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$push": {
                    "messages": message
                },
                "$set": {
                    "updated_at": now
                }
            }
        )

    def get_recent_messages(self, conversation_id: str, limit = 10):
        conversation = self.find_by_id(conversation_id)

        if not conversation:
            return []
        
        messages = conversation.get("messages", [])

        return messages[-limit:]
    
    def delete_by_user_and_course(self, user_id, course_id):
        self.history_collection.delete_many({
            "user_id": user_id,
            "course_id": course_id
        })