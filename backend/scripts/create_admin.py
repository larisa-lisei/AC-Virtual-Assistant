import os

from dotenv import load_dotenv
import bcrypt
from db.mongo import db

load_dotenv()

def create_admin():
    collection = db["users"]

    if collection.find_one({"role": "admin"}):
        print("Admin already exists.")
        return
    
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")

    if not email or not password:
        print("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.")
        return
    
    hashed_pwd = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode()

    admin_user = {
        "email": email,
        "role": "admin",
        "is_active": True,
        "password": hashed_pwd,
    }

    collection.insert_one(admin_user)
    print("Admin created.")

if __name__ == '__main__':
    create_admin()
