from .repository import ConversationRepository
from .service import ConversationService

def get_conversation_service() -> ConversationService:
    return ConversationService(ConversationRepository())