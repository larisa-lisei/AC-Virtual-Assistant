class ConversationNotFoundError(Exception):
    def __str__(self):
        return "Conversation not found."
    
class ConversationAccessDeniedError(Exception):
    def __str__(self):
        return "You do not have access to this conversation."