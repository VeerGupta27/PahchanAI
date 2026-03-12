from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # --- Application ---
    APP_NAME: str = "PahchanAI Central Intelligence System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # --- Redis ---
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Channel on which CIS publishes embeddings → nodes listen here
    REDIS_EMBEDDING_CHANNEL: str = "pahchan:embeddings"

    # Channel on which nodes publish match results → CIS listens here
    REDIS_MATCH_CHANNEL: str = "pahchan:matches"

    # --- PostgreSQL ---
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "pahchanai"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def DATABASE_URL_SYNC(self) -> str:
     return (
        f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
        f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    )

    # --- Matching ---
    # Cosine-similarity threshold; tune this for your FaceNet model
    MATCH_THRESHOLD: float = 0.75

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
