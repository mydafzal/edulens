"""
EduLens API — AI-Powered Resource Discovery for Educators
Built for Cambridge University Press & Assessment Hackathon 2025

Architecture: 3-Phase Pipeline powered by CurricuLLM + LangGraph

Phase 1 — SEARCH:  Query expansion (HyDE) → ERIC API retrieval → Trust-tier tagging
Phase 2 — EVALUATE: Dual-Agent filter (Bad Cop + Good Cop parallel) → Consensus scoring
Phase 3 — SYNTHESIZE: Citation-grounded summary from filtered sources

LLM: CurricuLLM API (OpenAI-compatible, curriculum-aware)
Search: ERIC API (1.5M+ peer-reviewed educational resources)
Orchestration: LangGraph (parallel nodes, conditional retry, state management)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    description="""
    ## EduLens API — AI-Powered Resource Discovery for Educators

    ### 3-Phase Search Pipeline

    | Phase | What Happens | LLM Calls | Time |
    |-------|-------------|-----------|------|
    | **Search** | HyDE query expansion → ERIC API retrieval → Trust-tier tagging | 1 CurricuLLM | ~1.5s |
    | **Evaluate** | Bad Cop + Good Cop dual-agent review (parallel) → Consensus | 2 CurricuLLM | ~2s |
    | **Synthesize** | Citation-grounded summary from filtered sources | 1 CurricuLLM | ~1.5s |

    **Total: 4 API calls, ~3-5 seconds end-to-end**

    ### Endpoints

    - `POST /search` — Full pipeline execution
    - `POST /evaluate` — Standalone URL quality assessment
    - `POST /tools/execute` — Run educational tools (Lesson Plan, Quiz, etc.)
    - `GET /health` — Service health check
    """,
    version="2.0.0",
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
app.include_router(router, prefix=settings.api_v1_prefix, tags=["EduLens Pipeline"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": settings.app_name,
        "version": "2.0.0",
        "architecture": "3-Phase Pipeline (Search → Evaluate → Synthesize)",
        "llm_provider": "CurricuLLM",
        "model": settings.curricullm_model,
        "docs": "/docs",
        "health": f"{settings.api_v1_prefix}/health",
        "endpoints": {
            "search": f"{settings.api_v1_prefix}/search",
            "evaluate": f"{settings.api_v1_prefix}/evaluate",
            "tools": f"{settings.api_v1_prefix}/tools/execute",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
