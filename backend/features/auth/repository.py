from datetime import datetime, timezone
from db.mongo import db

class AuthRepository:
    def __init__(self):
        self.blacklist = db["token_blacklist"]

    def blacklist_token(self, token: str, expires_at: datetime):
        self.blacklist.insert_one({
            "token": token,
            "expires_at": expires_at
        })

    def is_token_blacklisted(self, token: str) -> bool:
        return self.blacklist.find_one({"token": token}) is not None
    
    def cleanup_expired_token(self):
        self.blacklist.delete_many({
            "expires_at": {"$lt": datetime.now(timezone.utc)}
        })