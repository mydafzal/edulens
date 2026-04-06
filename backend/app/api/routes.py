"""
EduLens API Routes
"""

import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    SearchRequest,
    SearchResponse,
    LocalizeRequest,
    LocalizeResponse,
    EvaluateRequest,
    EvaluateResponse,
    Resource,
    ResourceSource,
    QualityScorecard,
    QualityDimension,
    QualityLevel,
    ResourceType,
    LicenseType,
    Adaptation,
    AdaptationType,
    LocalContext,
    ScopeLevel,
)

router = APIRouter()


# Sample data for demo purposes
SAMPLE_RESOURCES = [
    Resource(
        id="1",
        title="Water Scarcity in the Murray-Darling Basin",
        description="Comprehensive overview of water management challenges in Australia's most important river system, including historical context, current policies, and future projections.",
        type=ResourceType.article,
        thumbnail="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=400&fit=crop",
        source=ResourceSource(
            name="ABC Education",
            url="https://education.abc.net.au",
            author="Dr. Sarah Mitchell",
            publishDate="2024-08-15",
            license="CC BY-NC",
            licenseType=LicenseType.cc_by_nc,
        ),
        scorecard=QualityScorecard(
            accuracy=QualityDimension(
                name="accuracy",
                label="Accuracy",
                level=QualityLevel.safe,
                score=92,
                rationale="Information verified against Bureau of Meteorology data and peer-reviewed sources.",
            ),
            bias=QualityDimension(
                name="bias",
                label="Bias",
                level=QualityLevel.safe,
                score=88,
                rationale="Presents multiple stakeholder perspectives including farmers, environmentalists, and Indigenous communities.",
            ),
            ageAppropriateness=QualityDimension(
                name="ageAppropriateness",
                label="Age Appropriate",
                level=QualityLevel.safe,
                score=95,
                rationale="Language and concepts suitable for Years 9-10. Complex terms are explained.",
            ),
            culturalSensitivity=QualityDimension(
                name="culturalSensitivity",
                label="Cultural Sensitivity",
                level=QualityLevel.safe,
                score=85,
                rationale="Includes First Nations water rights perspectives with appropriate cultural framing.",
            ),
            safety=QualityDimension(
                name="safety",
                label="Safety",
                level=QualityLevel.safe,
                score=100,
                rationale="No safety concerns identified.",
            ),
            overallScore=92,
        ),
        curriculumAlignment=["ACHGK051", "ACHGK052"],
        yearLevels=[9, 10],
        subjects=["Geography", "Science"],
        tags=["Water", "Environment", "Murray-Darling", "Sustainability"],
    ),
    Resource(
        id="2",
        title="Climate Data Visualization Tool",
        description="Interactive tool allowing students to explore climate data trends across Australian regions. Includes temperature, rainfall, and extreme weather event data.",
        type=ResourceType.interactive,
        thumbnail="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
        source=ResourceSource(
            name="Bureau of Meteorology",
            url="http://www.bom.gov.au/climate/data/",
            publishDate="2024-06-01",
            license="CC BY",
            licenseType=LicenseType.cc_by,
        ),
        scorecard=QualityScorecard(
            accuracy=QualityDimension(
                name="accuracy",
                label="Accuracy",
                level=QualityLevel.safe,
                score=98,
                rationale="Official government data source, regularly updated and verified.",
            ),
            bias=QualityDimension(
                name="bias",
                label="Bias",
                level=QualityLevel.safe,
                score=95,
                rationale="Presents raw data without editorial interpretation.",
            ),
            ageAppropriateness=QualityDimension(
                name="ageAppropriateness",
                label="Age Appropriate",
                level=QualityLevel.caution,
                score=72,
                rationale="Interface may require teacher guidance for younger students. Data literacy skills needed.",
            ),
            culturalSensitivity=QualityDimension(
                name="culturalSensitivity",
                label="Cultural Sensitivity",
                level=QualityLevel.safe,
                score=90,
                rationale="Neutral data presentation. Could benefit from Indigenous weather knowledge integration.",
            ),
            safety=QualityDimension(
                name="safety",
                label="Safety",
                level=QualityLevel.safe,
                score=100,
                rationale="No safety concerns.",
            ),
            overallScore=91,
        ),
        yearLevels=[9, 10, 11, 12],
        subjects=["Science", "Geography", "Mathematics"],
        tags=["Climate", "Data", "Interactive", "Statistics"],
    ),
    Resource(
        id="3",
        title="First Nations Water Stories: The Murray River",
        description="Documentary exploring the cultural significance of the Murray River to the Ngarrindjeri, Yorta Yorta, and other First Nations peoples. Includes Dreaming stories and contemporary voices.",
        type=ResourceType.video,
        thumbnail="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
        source=ResourceSource(
            name="AIATSIS",
            url="https://aiatsis.gov.au",
            author="Ngarrindjeri Elders Council",
            publishDate="2023-11-20",
            license="Educational Use",
            licenseType=LicenseType.copyrighted,
        ),
        scorecard=QualityScorecard(
            accuracy=QualityDimension(
                name="accuracy",
                label="Accuracy",
                level=QualityLevel.safe,
                score=95,
                rationale="Content developed in partnership with Traditional Owners and verified by AIATSIS.",
            ),
            bias=QualityDimension(
                name="bias",
                label="Bias",
                level=QualityLevel.safe,
                score=90,
                rationale="Centres First Nations perspectives as intended. Balanced historical context provided.",
            ),
            ageAppropriateness=QualityDimension(
                name="ageAppropriateness",
                label="Age Appropriate",
                level=QualityLevel.safe,
                score=88,
                rationale="Suitable for Years 7+. Some content about colonisation impact requires sensitive handling.",
            ),
            culturalSensitivity=QualityDimension(
                name="culturalSensitivity",
                label="Cultural Sensitivity",
                level=QualityLevel.safe,
                score=98,
                rationale="Exemplary cultural protocols observed. Community-led production with proper permissions.",
            ),
            safety=QualityDimension(
                name="safety",
                label="Safety",
                level=QualityLevel.safe,
                score=100,
                rationale="No safety concerns.",
            ),
            overallScore=94,
        ),
        yearLevels=[7, 8, 9, 10],
        subjects=["Geography", "History", "Aboriginal Studies"],
        tags=["First Nations", "Water", "Culture", "Murray River", "Documentary"],
    ),
    Resource(
        id="4",
        title="Sustainable Agriculture in Regional Australia",
        description="Case study examining sustainable farming practices in drought-prone regions, featuring interviews with farmers adapting to changing water availability.",
        type=ResourceType.pdf,
        source=ResourceSource(
            name="CSIRO",
            url="https://csiro.au",
            author="Agricultural Research Division",
            publishDate="2024-03-10",
            license="CC BY-SA",
            licenseType=LicenseType.cc_by_sa,
        ),
        scorecard=QualityScorecard(
            accuracy=QualityDimension(
                name="accuracy",
                label="Accuracy",
                level=QualityLevel.safe,
                score=96,
                rationale="Peer-reviewed research from Australia's leading science agency.",
            ),
            bias=QualityDimension(
                name="bias",
                label="Bias",
                level=QualityLevel.caution,
                score=78,
                rationale="Focuses on successful adaptations - may underrepresent challenges faced by smaller farms.",
            ),
            ageAppropriateness=QualityDimension(
                name="ageAppropriateness",
                label="Age Appropriate",
                level=QualityLevel.safe,
                score=82,
                rationale="Written for general audience. Some technical terms may need explanation for Year 9.",
            ),
            culturalSensitivity=QualityDimension(
                name="culturalSensitivity",
                label="Cultural Sensitivity",
                level=QualityLevel.caution,
                score=70,
                rationale="Limited representation of Indigenous land management practices. Opportunity to supplement.",
            ),
            safety=QualityDimension(
                name="safety",
                label="Safety",
                level=QualityLevel.safe,
                score=100,
                rationale="No safety concerns.",
            ),
            overallScore=85,
        ),
        yearLevels=[9, 10, 11],
        subjects=["Geography", "Agriculture", "Science"],
        tags=["Agriculture", "Sustainability", "Drought", "Farming", "Regional"],
    ),
]


@router.post("/search", response_model=SearchResponse)
async def search_resources(request: SearchRequest):
    """
    Search for educational resources based on query and filters.
    """
    start_time = time.time()

    # Simple keyword filtering for demo
    query_lower = request.query.lower()
    results = []

    for resource in SAMPLE_RESOURCES:
        # Check if query matches title, description, or tags
        matches = (
            query_lower in resource.title.lower()
            or query_lower in resource.description.lower()
            or (resource.tags and any(query_lower in tag.lower() for tag in resource.tags))
        )

        if matches or not request.query.strip():
            # Apply filters if provided
            if request.filters:
                if request.filters.year_levels:
                    if not resource.yearLevels or not any(
                        y in request.filters.year_levels for y in resource.yearLevels
                    ):
                        continue
                if request.filters.subjects:
                    if not resource.subjects or not any(
                        s in request.filters.subjects for s in resource.subjects
                    ):
                        continue
                if request.filters.content_types:
                    if resource.type not in request.filters.content_types:
                        continue
                if request.filters.min_quality_score:
                    if resource.scorecard.overall_score < request.filters.min_quality_score:
                        continue
            results.append(resource)

    # If no results found, return all resources (for demo)
    if not results:
        results = SAMPLE_RESOURCES

    query_time = time.time() - start_time

    return SearchResponse(
        resources=results,
        totalCount=len(results),
        queryTime=query_time,
        suggestions=[
            "Water scarcity Year 9 Geography Queensland",
            "First Nations perspectives colonisation",
            "Climate change data visualization",
        ],
    )


@router.post("/localize", response_model=LocalizeResponse)
async def localize_resource(request: LocalizeRequest):
    """
    Generate localized adaptations for a resource based on local context.
    """
    # Find the resource
    resource = None
    for r in SAMPLE_RESOURCES:
        if r.id == request.resource_id:
            resource = r
            break

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Generate sample adaptations based on context
    adaptations = generate_sample_adaptations(resource, request.local_context)

    return LocalizeResponse(
        resource=resource,
        adaptations=adaptations,
        localContext=request.local_context,
    )


def generate_sample_adaptations(resource: Resource, context: LocalContext) -> List[Adaptation]:
    """Generate sample adaptations based on the resource and local context."""
    adaptations = []

    location_name = context.suburb or context.region or context.state or context.country

    # Example adaptation
    adaptations.append(
        Adaptation(
            type=AdaptationType.example,
            original="Consider a major river system in your country...",
            adapted=f"The local waterways near {location_name} face similar challenges...",
            rationale=f"Replaced generic example with local {location_name} reference",
        )
    )

    # Reference adaptation
    if context.state:
        adaptations.append(
            Adaptation(
                type=AdaptationType.reference,
                original="Local farmers have adapted to water scarcity...",
                adapted=f"Farmers in {context.state} have pioneered innovative water management systems...",
                rationale=f"Added specific regional reference relevant to {context.state}",
            )
        )

    # Cultural adaptation
    adaptations.append(
        Adaptation(
            type=AdaptationType.cultural,
            original="Indigenous communities have traditional water management practices...",
            adapted=f"The Traditional Owners of the {location_name} region have practiced sustainable water management for thousands of years...",
            rationale="Incorporated specific local First Nations context per AIATSIS guidelines",
        )
    )

    # Reading level adaptation
    if context.year_level and context.year_level <= 9:
        adaptations.append(
            Adaptation(
                type=AdaptationType.reading_level,
                original="The anthropogenic factors contributing to hydrological stress...",
                adapted="Human activities that put pressure on water supplies...",
                rationale=f"Simplified academic language for Year {context.year_level} reading level",
            )
        )

    return adaptations


@router.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_resource(request: EvaluateRequest):
    """
    Evaluate a URL and generate a quality scorecard.
    """
    start_time = time.time()

    # For demo, return a sample evaluation
    resource = Resource(
        id=str(uuid.uuid4()),
        title="Evaluated Resource",
        description="This resource was evaluated using EduLens AI quality analysis.",
        type=ResourceType.website,
        source=ResourceSource(
            name="External Source",
            url=request.url,
            licenseType=LicenseType.unknown,
        ),
        scorecard=QualityScorecard(
            accuracy=QualityDimension(
                name="accuracy",
                label="Accuracy",
                level=QualityLevel.caution,
                score=75,
                rationale="Content requires verification against primary sources.",
            ),
            bias=QualityDimension(
                name="bias",
                label="Bias",
                level=QualityLevel.safe,
                score=80,
                rationale="Multiple perspectives represented.",
            ),
            ageAppropriateness=QualityDimension(
                name="ageAppropriateness",
                label="Age Appropriate",
                level=QualityLevel.safe,
                score=85,
                rationale=f"Suitable for Year {request.year_level or 'unspecified'} students.",
            ),
            culturalSensitivity=QualityDimension(
                name="culturalSensitivity",
                label="Cultural Sensitivity",
                level=QualityLevel.caution,
                score=70,
                rationale="Could benefit from additional cultural perspectives.",
            ),
            safety=QualityDimension(
                name="safety",
                label="Safety",
                level=QualityLevel.safe,
                score=95,
                rationale="No significant safety concerns identified.",
            ),
            overallScore=81,
        ),
        yearLevels=[request.year_level] if request.year_level else None,
        subjects=[request.subject] if request.subject else None,
    )

    evaluation_time = time.time() - start_time

    return EvaluateResponse(
        resource=resource,
        evaluationTime=evaluation_time,
    )


@router.get("/resources/{resource_id}", response_model=Resource)
async def get_resource(resource_id: str):
    """
    Get a specific resource by ID.
    """
    for resource in SAMPLE_RESOURCES:
        if resource.id == resource_id:
            return resource

    raise HTTPException(status_code=404, detail="Resource not found")


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "EduLens API"}
