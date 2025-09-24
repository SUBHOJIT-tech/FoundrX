from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RecommendationRequest(BaseModel):
    sector: str
    stage: str

@router.post("/recommend")
def get_recommendations(request: RecommendationRequest):
    print("--- Request received at /recommend endpoint ---")
    dummy_data = [
        {"domain": "Test Idea 1 (AI)", "description": "Connection is working.", "confidence": 95},
        {"domain": "Test Idea 2 (Fintech)", "description": "This is a test from backend.", "confidence": 92}
    ]
    print("--- Sending back dummy data ---")
    return dummy_data