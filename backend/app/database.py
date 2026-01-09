from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlmodel import SQLModel, Session
from .config import settings
from contextlib import contextmanager
from typing import Generator


# Create the database engine with connection pooling
engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
)


def create_db_and_tables():
    """Create database tables if they don't exist"""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Get a database session"""
    with Session(engine) as session:
        yield session


@contextmanager
def get_db_session():
    """Context manager for database sessions"""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()