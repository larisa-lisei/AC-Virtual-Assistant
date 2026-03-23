from fastapi import FastAPI
from features.users.routes import router as users_router

app = FastAPI(
    title="AC Virtual Assistant"
)

app.include_router(users_router)