from fastapi import FastAPI
from fastapi.params import Depends
from features.users.routes import router as users_router
from features.auth.routes import router as auth_router
from features.auth.dependencies import require_role
from features.rag.routes import router as rag_router
from features.feedback.routes import router as feedback_router

app = FastAPI(
    title="AC Virtual Assistant"
)

app.include_router(auth_router)
app.include_router(users_router, dependencies=[Depends(require_role("admin"))])
app.include_router(rag_router)
app.include_router(feedback_router)