"""
EduLens API - Main Application
AI-Powered Resource Discovery for Educators
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="""
    EduLens API - AI-Powered Resource Discovery for Educators

    Built for the Cambridge University Press & Assessment Hackathon 2025.

    ## Features

    - **Search**: Find educational resources across trusted sources
    - **Evaluate**: Quality scorecard for any resource (accuracy, bias, safety, etc.)
    - **Localize**: Adapt resources for your local classroom context

    ## Quality Dimensions

    Every resource is evaluated across 5 dimensions:
    - **Accuracy**: Factual credibility and source verification
    - **Bias**: Perspective balance and representation
    - **Age Appropriateness**: Suitability for target year levels
    - **Cultural Sensitivity**: First Nations and diverse perspectives
    - **Safety**: Classroom appropriateness
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix=settings.api_v1_prefix, tags=["EduLens"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "description": "AI-Powered Resource Discovery for Educators",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
