from langchain_chroma import Chroma
from langchain_core.documents import Document

from db.chroma import get_chroma_vector_store


class RagRepository:
    def __init__(self):
        self.vector_store: Chroma = get_chroma_vector_store()

    def add_documents(self, documents: list[Document], ids: list[str]):
        self.vector_store.add_documents(documents=documents, ids=ids)

    def similarity_search_by_course(
        self,
        query: str,
        course_id: str,
        relevant_chunks: int = 4,
        score_threshold: float = 1.0
    ) -> list[tuple[Document, float]]:
        results = self.vector_store.similarity_search_with_score(
            query=query,
            k=relevant_chunks,
            filter={"course_id": course_id}
        )

        return [(doc, score) for doc, score in results if score <= score_threshold]