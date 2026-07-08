from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ACTIVATION_TOKEN_EXPIRE_HOURS: int = 48

    CHROMA_PERSIST_DIR: str = "storage/chroma"
    UPLOAD_DIR: str = "storage/uploads"
    CHROMA_COLLECTION_NAME: str = "documents"
    DEFAULT_RELEVANT_CHUNKS: int = 25
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    RAG_SCORE_THRESHOLD: float = 1.2

    HISTORY_LIMIT: int = 15

    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()