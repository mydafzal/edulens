"""
Scora API - Main Application
AI-Powered Resource Discovery for Educators
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.base import engine, Base
from app.db import models  # noqa
from app.api import routes
from app.api.auth import router as auth_router
from app.api.library import router as library_router, router2 as searches_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (Alembic handles production migrations)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Scora API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(library_router, prefix="/api/v1")
app.include_router(searches_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"name": "Scora API", "version": "1.0.0", "status": "running"}
