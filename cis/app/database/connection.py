"""
database/connection.py
Async SQLAlchemy engine + session factory.
All database I/O in the CIS goes through AsyncSession.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

# Create the async engine (connection pool is managed automatically)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,          # SQL logging in debug mode
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,           # detect stale connections
)

# Session factory – use this everywhere instead of raw sessions
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


async def get_db() -> AsyncSession:
    """
    FastAPI dependency that yields a database session and
    guarantees cleanup even on exceptions.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def create_tables():
    """Create all tables on startup (dev/hackathon convenience)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
