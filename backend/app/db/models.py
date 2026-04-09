import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, Float, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="teacher")
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    profile: Mapped["ClassroomProfile"] = relationship("ClassroomProfile", back_populates="user", uselist=False)
    searches: Mapped[list["SearchHistory"]] = relationship("SearchHistory", back_populates="user")
    library: Mapped[list["LibraryResource"]] = relationship("LibraryResource", back_populates="user")
    saved_searches: Mapped[list["SavedSearch"]] = relationship("SavedSearch", back_populates="user")


class ClassroomProfile(Base):
    __tablename__ = "classroom_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    school_name: Mapped[str] = mapped_column(String(255), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    town: Mapped[str] = mapped_column(String(255), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="Australia")
    year_levels: Mapped[list] = mapped_column(JSON, default=list)
    subjects: Mapped[list] = mapped_column(JSON, default=list)
    # 13-field classroom context
    local_landmarks: Mapped[list] = mapped_column(JSON, default=list)
    first_nations_context: Mapped[list] = mapped_column(JSON, default=list)
    community_projects: Mapped[list] = mapped_column(JSON, default=list)
    cultural_figures: Mapped[list] = mapped_column(JSON, default=list)
    local_sports_teams: Mapped[list] = mapped_column(JSON, default=list)
    local_artists_music: Mapped[list] = mapped_column(JSON, default=list)
    student_interests: Mapped[list] = mapped_column(JSON, default=list)
    language_backgrounds: Mapped[list] = mapped_column(JSON, default=list)
    local_data_sources: Mapped[list] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="profile")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    grade_level: Mapped[str] = mapped_column(String(50), nullable=True)
    subject: Mapped[str] = mapped_column(String(100), nullable=True)
    sources_found: Mapped[int] = mapped_column(Integer, default=0)
    consensus_score: Mapped[float] = mapped_column(Float, nullable=True)
    total_time: Mapped[float] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="searches")


class LibraryResource(Base):
    __tablename__ = "library_resources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    resource_id: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    provider: Mapped[str] = mapped_column(String(255), nullable=True)
    snippet: Mapped[str] = mapped_column(Text, nullable=True)
    trust_tier: Mapped[str] = mapped_column(String(20), nullable=True)
    quality_score: Mapped[float] = mapped_column(Float, nullable=True)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=True)
    subject: Mapped[str] = mapped_column(String(100), nullable=True)
    grade_level: Mapped[str] = mapped_column(String(50), nullable=True)
    thumbnail: Mapped[str] = mapped_column(Text, nullable=True)
    curriculum_codes: Mapped[list] = mapped_column(JSON, default=list)
    full_data: Mapped[dict] = mapped_column(JSON, default=dict)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="library")


class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    query: Mapped[str] = mapped_column(Text, nullable=False)
    grade_level: Mapped[str] = mapped_column(String(50), nullable=True)
    full_result: Mapped[dict] = mapped_column(JSON, default=dict)
    sources_count: Mapped[int] = mapped_column(Integer, default=0)
    consensus_score: Mapped[float] = mapped_column(Float, nullable=True)
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="saved_searches")
