"""
Health check endpoints for Kubernetes liveness and readiness probes.
"""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.database import get_session

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Liveness probe endpoint.
    Returns 200 if the service is running.
    """
    return {"status": "healthy", "service": "todo-chatbot-backend"}


@router.get("/ready")
async def readiness_check():
    """
    Readiness probe endpoint.
    Checks if the service is ready to accept traffic by verifying database connectivity.
    """
    try:
        # Get database session
        db = next(get_session())

        # Execute a simple query to verify database connection
        result = db.execute(text("SELECT 1"))
        result.fetchone()

        return {
            "status": "ready",
            "service": "todo-chatbot-backend",
            "database": "connected"
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service not ready: Database connection failed - {str(e)}"
        )
