from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
import uuid
from datetime import datetime
from app.db.base import get_db
from app.db.models import LibraryResource, SavedSearch, SearchHistory

router = APIRouter(prefix="/library", tags=["library"])

class SaveResourceRequest(BaseModel):
    user_id: str
    resource_id: str
    title: str
    url: str
    provider: str | None = None
    snippet: str | None = None
    trust_tier: str | None = None
    quality_score: float | None = None
    resource_type: str | None = None
    subject: str | None = None
    grade_level: str | None = None
    thumbnail: str | None = None
    curriculum_codes: list = []
    full_data: dict = {}

@router.post("/save")
async def save_resource(data: SaveResourceRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(LibraryResource).where(
            LibraryResource.user_id == uuid.UUID(data.user_id),
            LibraryResource.resource_id == data.resource_id
        )
    )
    if existing.scalar_one_or_none():
        return {"status": "already_saved"}
    resource = LibraryResource(**{**data.model_dump(), "user_id": uuid.UUID(data.user_id)})
    db.add(resource)
    await db.commit()
    return {"status": "saved"}

@router.get("/{user_id}")
async def get_library(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LibraryResource)
        .where(LibraryResource.user_id == uuid.UUID(user_id))
        .order_by(LibraryResource.saved_at.desc())
    )
    resources = result.scalars().all()
    return [
        {
            "id": str(r.id), "resource_id": r.resource_id, "title": r.title,
            "url": r.url, "provider": r.provider, "snippet": r.snippet,
            "trust_tier": r.trust_tier, "quality_score": r.quality_score,
            "resource_type": r.resource_type, "subject": r.subject,
            "grade_level": r.grade_level, "thumbnail": r.thumbnail,
            "curriculum_codes": r.curriculum_codes, "saved_at": r.saved_at.isoformat()
        }
        for r in resources
    ]

@router.delete("/{user_id}/{resource_id}")
async def remove_resource(user_id: str, resource_id: str, db: AsyncSession = Depends(get_db)):
    await db.execute(
        delete(LibraryResource).where(
            LibraryResource.user_id == uuid.UUID(user_id),
            LibraryResource.resource_id == resource_id
        )
    )
    await db.commit()
    return {"status": "removed"}

router2 = APIRouter(prefix="/searches", tags=["searches"])

class SaveSearchRequest(BaseModel):
    user_id: str
    query: str
    grade_level: str | None = None
    full_result: dict = {}
    sources_count: int = 0
    consensus_score: float | None = None

@router2.post("/save")
async def save_search(data: SaveSearchRequest, db: AsyncSession = Depends(get_db)):
    saved = SavedSearch(
        user_id=uuid.UUID(data.user_id),
        query=data.query,
        grade_level=data.grade_level,
        full_result=data.full_result,
        sources_count=data.sources_count,
        consensus_score=data.consensus_score,
    )
    db.add(saved)
    # Also log to history
    history = SearchHistory(
        user_id=uuid.UUID(data.user_id),
        query=data.query,
        grade_level=data.grade_level,
        sources_found=data.sources_count,
        consensus_score=data.consensus_score,
    )
    db.add(history)
    await db.commit()
    return {"status": "saved", "id": str(saved.id)}

@router2.get("/{user_id}")
async def get_saved_searches(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SavedSearch)
        .where(SavedSearch.user_id == uuid.UUID(user_id))
        .order_by(SavedSearch.saved_at.desc())
        .limit(20)
    )
    searches = result.scalars().all()
    return [
        {
            "id": str(s.id), "query": s.query, "grade_level": s.grade_level,
            "sources_count": s.sources_count, "consensus_score": s.consensus_score,
            "saved_at": s.saved_at.isoformat(), "full_result": s.full_result
        }
        for s in searches
    ]

@router2.get("/history/{user_id}")
async def get_search_history(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SearchHistory)
        .where(SearchHistory.user_id == uuid.UUID(user_id))
        .order_by(SearchHistory.created_at.desc())
        .limit(20)
    )
    history = result.scalars().all()
    return [
        {
            "id": str(h.id), "query": h.query, "grade_level": h.grade_level,
            "sources_found": h.sources_found, "consensus_score": h.consensus_score,
            "created_at": h.created_at.isoformat()
        }
        for h in history
    ]
