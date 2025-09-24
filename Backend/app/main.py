from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, startups, analytics, predictions
from app.database import Base, engine

app = FastAPI(title="AI Startup Advisor")

# Create DB tables
Base.metadata.create_all(bind=engine)

# CORS setup (important for frontend integration later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(startups.router, prefix="/startups", tags=["Startups"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])

@app.get("/")
def root():
    return {"message": "Welcome to AI Startup Advisor Backend!"}
