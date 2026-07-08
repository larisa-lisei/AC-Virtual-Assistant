from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    CHROMA_PERSIST_DIR: str = "storage/chroma"
    UPLOAD_DIR: str = "storage/uploads"
    CHROMA_COLLECTION_NAME: str = "documents"
    DEFAULT_RELEVANT_CHUNKS: int = 25
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    RAG_SCORE_THRESHOLD: float = 1.2

    HISTORY_LIMIT: int = 15

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )

settings = Settings()