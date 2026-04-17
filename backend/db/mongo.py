from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "licenta_db")

client = MongoClient(MONGO_URL)
db: Database = client[DATABASE_NAME]

users: Collection = db["users"]
blacklist: Collection = db["token_blacklist"]

pdf_chunks_collection: Collection = db["pdf_chunks"]
chat_history_collection: Collection = db["chat_history"]