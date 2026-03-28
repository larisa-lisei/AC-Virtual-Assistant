from fastapi import FastAPI
from fastapi.params import Depends
from features.users.routes import router as users_router
from features.auth.routes import router as auth_router
from features.auth.dependencies import require_role

app = FastAPI(
    title="AC Virtual Assistant"
)

app.include_router(auth_router)
app.include_router(users_router, dependencies=[Depends(require_role("admin"))])