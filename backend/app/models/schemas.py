"""
EduLens API Schemas
Pydantic models for request/response validation
"""

from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from enum import Enum


# Enums
class QualityLevel(str, Enum):
    safe = "safe"
    caution = "caution"
    warning = "warning"


class ResourceType(str, Enum):
    article = "article"
    video = "video"
    pdf = "pdf"
    interactive = "interactive"
    image = "image"
    website = "website"


class LicenseType(str, Enum):
    cc_by = "cc-by"
    cc_by_sa = "cc-by-sa"
    cc_by_nc = "cc-by-nc"
    public_domain = "public-domain"
    copyrighted = "copyrighted"
    unknown = "unknown"


class ScopeLevel(str, Enum):
    country = "country"
    state = "state"
    region = "region"
    suburb = "suburb"
    school = "school"
    classroom = "class"
    individual = "individual"


class AdaptationType(str, Enum):
    example = "example"
    reference = "reference"
    language = "language"
    cultural = "cultural"
    reading_level = "reading-level"


# Quality Scorecard Models
class QualityDimension(BaseModel):
    name: str
    label: str
    level: QualityLevel
    score: int = Field(ge=0, le=100)
    rationale: str


class QualityScorecard(BaseModel):
    accuracy: QualityDimension
    bias: QualityDimension
    age_appropriateness: QualityDimension = Field(alias="ageAppropriateness")
    cultural_sensitivity: QualityDimension = Field(alias="culturalSensitivity")
    safety: QualityDimension
    overall_score: int = Field(ge=0, le=100, alias="overallScore")

    class Config:
        populate_by_name = True


# Resource Models
class ResourceSource(BaseModel):
    name: str
    url: str
    author: Optional[str] = None
    publish_date: Optional[str] = Field(None, alias="publishDate")
    license: Optional[str] = None
    license_type: Optional[LicenseType] = Field(None, alias="licenseType")

    class Config:
        populate_by_name = True


class Resource(BaseModel):
    id: str
    title: str
    description: str
    type: ResourceType
    thumbnail: Optional[str] = None
    source: ResourceSource
    scorecard: QualityScorecard
    curriculum_alignment: Optional[List[str]] = Field(None, alias="curriculumAlignment")
    year_levels: Optional[List[int]] = Field(None, alias="yearLevels")
    subjects: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    class Config:
        populate_by_name = True


# Adaptation Models
class Adaptation(BaseModel):
    type: AdaptationType
    original: str
    adapted: str
    rationale: str


# Context Models
class LocalContext(BaseModel):
    country: str
    state: Optional[str] = None
    region: Optional[str] = None
    suburb: Optional[str] = None
    school_name: Optional[str] = Field(None, alias="schoolName")
    year_level: Optional[int] = Field(None, alias="yearLevel")
    subject: Optional[str] = None
    student_interests: Optional[List[str]] = Field(None, alias="studentInterests")
    community_anchors: Optional[List[str]] = Field(None, alias="communityAnchors")

    class Config:
        populate_by_name = True


class ClassroomProfile(BaseModel):
    id: str
    name: str
    location: dict  # {country, state, region?, suburb?}
    school: Optional[str] = None
    year_level: int = Field(alias="yearLevel")
    subject: str
    student_count: Optional[int] = Field(None, alias="studentCount")
    student_backgrounds: Optional[List[str]] = Field(None, alias="studentBackgrounds")
    student_interests: Optional[List[str]] = Field(None, alias="studentInterests")
    community_anchors: Optional[List[str]] = Field(None, alias="communityAnchors")
    language_context: Optional[dict] = Field(None, alias="languageContext")

    class Config:
        populate_by_name = True


# API Request/Response Models
class SearchFilters(BaseModel):
    year_levels: Optional[List[int]] = Field(None, alias="yearLevels")
    subjects: Optional[List[str]] = None
    content_types: Optional[List[ResourceType]] = Field(None, alias="contentTypes")
    min_quality_score: Optional[int] = Field(None, ge=0, le=100, alias="minQualityScore")

    class Config:
        populate_by_name = True


class SearchRequest(BaseModel):
    query: str
    scope: ScopeLevel = ScopeLevel.state
    filters: Optional[SearchFilters] = None
    classroom_profile: Optional[ClassroomProfile] = Field(None, alias="classroomProfile")

    class Config:
        populate_by_name = True


class SearchResponse(BaseModel):
    resources: List[Resource]
    total_count: int = Field(alias="totalCount")
    query_time: float = Field(alias="queryTime")
    suggestions: Optional[List[str]] = None

    class Config:
        populate_by_name = True


class LocalizeRequest(BaseModel):
    resource_id: str = Field(alias="resourceId")
    local_context: LocalContext = Field(alias="localContext")

    class Config:
        populate_by_name = True


class LocalizeResponse(BaseModel):
    resource: Resource
    adaptations: List[Adaptation]
    local_context: LocalContext = Field(alias="localContext")

    class Config:
        populate_by_name = True


class EvaluateRequest(BaseModel):
    url: str
    year_level: Optional[int] = Field(None, alias="yearLevel")
    subject: Optional[str] = None

    class Config:
        populate_by_name = True


class EvaluateResponse(BaseModel):
    resource: Resource
    evaluation_time: float = Field(alias="evaluationTime")

    class Config:
        populate_by_name = True
