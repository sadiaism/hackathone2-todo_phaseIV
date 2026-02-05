from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import ConfigDict
import os

load_dotenv()

class Settings(BaseSettings):
    database_url: str
    neon_db_host: Optional[str] = None
    neon_db_name: Optional[str] = None
    neon_db_user: Optional[str] = None
    neon_db_password: Optional[str] = None
    neon_db_port: Optional[int] = 5432
    gemini_api_key: Optional[str] = None

    # JWT Configuration
    BETTER_AUTH_SECRET: str
    JWT_ALGORITHM: str = "HS256"  # Using HS256 with shared secret instead of RS256
    JWT_EXPIRATION_DELTA: int = 604800  # 7 days in seconds

    model_config = ConfigDict(env_file=".env")


# Create settings instance with conditional logic for testing
def get_settings():
    # Check if we're in a testing environment
    if os.getenv("TESTING"):
        # For testing, use SQLite in-memory database
        import tempfile
        temp_db_path = os.path.join(tempfile.gettempdir(), "test.db")
        settings = Settings(database_url=f"sqlite:///{temp_db_path}")
        return settings
    else:
        # In normal operation, require the database_url from environment
        return Settings()


settings = get_settings()