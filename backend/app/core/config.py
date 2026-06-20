import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "DisasterMind AI Command Backend"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = Field("09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7", env="JWT_SECRET")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days default local clearance
    
    # PostgreSQL Configuration
    POSTGRES_SERVER: str = Field("localhost", env="POSTGRES_SERVER")
    POSTGRES_USER: str = Field("postgres", env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field("postgres", env="POSTGRES_PASSWORD")
    POSTGRES_DB: str = Field("disastermind", env="POSTGRES_DB")
    POSTGRES_PORT: str = Field("5432", env="POSTGRES_PORT")
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
