from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import require_user
from app.routers import resume

app = FastAPI(title="Resume Editor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, dependencies=[Depends(require_user)])


@app.get("/health")
def health():
    return {"status": "ok"}
