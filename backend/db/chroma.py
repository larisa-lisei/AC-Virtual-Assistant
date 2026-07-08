from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from core.config import settings

def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL_NAME,
        encode_kwargs={"normalize_embeddings": True}
    )


def get_chroma_vector_store() -> Chroma:
    return Chroma(
        collection_name=settings.CHROMA_COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=settings.CHROMA_PERSIST_DIR,
        collection_configuration={"hnsw": {"space": "cosine"}}
    )
