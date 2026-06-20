from features.courses.exceptions import CourseAccessDeniedError
from features.users.enums import UserRole

from .exceptions import ConversationNotFoundError, ConversationAccessDeniedError
from .schemas import ConversationHistoryResponse, HistoryMessageResponse
from .enums import ConvRole, ConvType


class ConversationService:
    def __init__(self, conversation_repository):
        self.repository = conversation_repository

    def _ensure_conversation_access(self, conversation, user_id, course_id, conv_type: ConvType):
        if conversation.get("user_id") != user_id:
            raise ConversationAccessDeniedError()
        if conversation.get("course_id") != course_id:
            raise ConversationAccessDeniedError()
        if conversation.get("conversation_type") != conv_type:
            raise ConversationAccessDeniedError()

    def get_or_create_conversation(self, conversation_id, user_id, course_id, course_name, conversation_type: ConvType):
        if conversation_id:
            conversation = self.repository.find_by_id(conversation_id)

            if not conversation:
                raise ConversationNotFoundError()
            
            self._ensure_conversation_access(conversation, user_id, course_id, conversation_type)
            
            return conversation_id

        existing_conv = self.repository.find_by_user_and_course(user_id, course_id, conversation_type)
    
        if existing_conv:
            return str(existing_conv["_id"])
        
        return self.repository.create_conversation(user_id, course_id, course_name, conversation_type)

    def get_active_conversation(self, user_id, course_id, conversation_type: ConvType, include_sources: bool) -> ConversationHistoryResponse:
        conversation = self.repository.find_by_user_and_course(user_id, course_id, conversation_type)

        if not conversation:
            return ConversationHistoryResponse(
                conversation_id=None,
                messages=[]
            )
        
        return ConversationHistoryResponse(
            conversation_id=str(conversation["_id"]),
            messages=[
                HistoryMessageResponse(
                    sender=message.get("sender", ConvRole.user.value),
                    content=message.get("content", ""),
                    sources=(
                        message.get("sources", [])
                        if include_sources
                        else []
                    )
                )
                for message in conversation.get("messages", [])
            ]
        )

    def delete_active_conversation(self, user_id, course_id, conversation_type: ConvType):
        self.repository.delete_by_user_and_course(user_id, course_id, conversation_type)

    def get_recent_messages(self, conversation_id, limit):
        return self.repository.get_recent_messages(conversation_id, limit)
    
    def save_exchange(self, conversation_id, user_message, assistant_message, sources: list[dict] | None = None):
        self.repository.append_message(
            conversation_id=conversation_id,
            sender=ConvRole.user,
            content=user_message
        )

        self.repository.append_message(
            conversation_id=conversation_id,
            sender=ConvRole.assistant,
            content=assistant_message,
            sources=sources
        )
