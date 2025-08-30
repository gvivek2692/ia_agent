"""
Web search API endpoints
"""

from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.web_search_service import WebSearchService

router = APIRouter()
web_search_service = WebSearchService()


class SearchRequest(BaseModel):
    query: str
    location: Optional[str] = "India"
    num: Optional[int] = 5


@router.post("/search")
async def search(request: SearchRequest):
    """Perform web search using Serper API"""
    try:
        if not request.query:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "Search query is required"
                }
            )
        
        search_results = await web_search_service.search(request.query, {
            "location": request.location or "India",
            "num": request.num or 5
        })
        
        success = "error" not in search_results
        
        return {
            "success": success,
            "results": search_results,
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": "Search service unavailable"
            }
        )