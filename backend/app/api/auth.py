from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
import uuid
from app.db.base import get_db
from app.db.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    name: str | None = None
    role: str | None = "teacher"

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str

@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find or create user (demo mode - any email works)
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            id=uuid.uuid4(),
            email=data.email,
            name=data.name or data.email.split("@")[0],
            role=data.role or "teacher",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role,
    )

@router.get("/me/{user_id}", response_model=UserResponse)
async def get_me(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=str(user.id), email=user.email, name=user.name, role=user.role)

@router.put("/profile/{user_id}")
async def update_profile(user_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    from app.db.models import ClassroomProfile
    result = await db.execute(
        select(ClassroomProfile).where(ClassroomProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        profile = ClassroomProfile(user_id=uuid.UUID(user_id))
        db.add(profile)
    for key, value in data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)
    await db.commit()
    return {"status": "ok"}
