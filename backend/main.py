from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import Depends
from features.users.routes import router as users_router
from features.auth.routes import router as auth_router
from features.auth.dependencies import require_role
from features.rag.routes import router as rag_router
from features.feedback.routes import router as feedback_router

import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="AC Virtual Assistant"
)

FRONTEND_URL = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(users_router, dependencies=[Depends(require_role("admin"))])
app.include_router(rag_router)
app.include_router(feedback_router)