from pydantic import BaseModel, EmailStr
from typing import Optional

# User schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        orm_mode = True

# Startup schemas
class StartupCreate(BaseModel):
    name: str
    domain: str
    stage: Optional[str] = "Idea"
    funding: Optional[float] = 0.0

class StartupResponse(BaseModel):
    id: int
    name: str
    domain: str
    stage: str
    funding: float

    class Config:
        orm_mode = True

# Analytics schemas
class AnalyticsInput(BaseModel):
    revenue: float
    expenses: float
    tasks_completed: int
    tasks_total: int

class AnalyticsResponse(BaseModel):
    profitability: float
    productivity: float
    suggestion: str
