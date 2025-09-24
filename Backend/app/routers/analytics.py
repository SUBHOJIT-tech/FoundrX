from fastapi import APIRouter
from .. import schemas

router = APIRouter()

@router.post("/", response_model=schemas.AnalyticsResponse)
def analyze(data: schemas.AnalyticsInput):
    profitability = data.revenue - data.expenses
    productivity = (data.tasks_completed / data.tasks_total) * 100 if data.tasks_total > 0 else 0

    suggestion = "Looks good! Keep scaling 🚀"
    if profitability < 0:
        suggestion = "Cut costs or increase revenue to improve profitability."
    elif productivity < 50:
        suggestion = "Focus on team efficiency to improve productivity."

    return {
        "profitability": profitability,
        "productivity": productivity,
        "suggestion": suggestion
    }
