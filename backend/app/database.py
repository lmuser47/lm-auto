import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("Set DATABASE_URL in .env or your deployment environment.")

engine = create_engine(
    make_url(database_url).set(drivername="postgresql+psycopg"),
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=0,
    connect_args={"sslmode": "require", "connect_timeout": 10},
)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    """Provide one session per request; routes explicitly commit writes."""
    with SessionLocal() as session:
        yield session
