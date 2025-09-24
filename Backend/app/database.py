# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./test.db"  # ya koi PostgreSQL/MySQL URL

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}  # SQLite ke liye
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

