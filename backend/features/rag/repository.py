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

    
    def get_uploaded_documents_by_course(self, course_id: str) -> list[dict]:
        result = self.vector_store.get(
            where={"course_id": course_id},
            include=["metadatas"]
        )

        documents_by_id: dict[str, dict] = {}

        for metadata in result.get("metadatas", []):
            # ensure metadata exists
            if not metadata or "doc_id" not in metadata:
                continue

            doc_id = metadata.get("doc_id")

            # first appeareance of a chunk correspondent to doc_id 
            if doc_id not in documents_by_id:
                documents_by_id[doc_id] = {
                    "doc_id": doc_id,
                    "filename": metadata.get("filename") or "Unknown PDF",
                    "chunks_indexed": 0
                }

            # increase number of chunks for this doc_id
            documents_by_id[doc_id]["chunks_indexed"] += 1

        return list(documents_by_id.values())
    
    def delete_document_by_course(self, course_id: str, doc_id: str):
        # get all chunks with the same doc_id and course_id
        result = self.vector_store.get(
            where={
                "$and":[
                    {"course_id": course_id},
                    {"doc_id": doc_id}
                ]
            },
            include=["metadatas"]
        )

        # get ids of chunks
        ids = result.get("ids", [])
        metadatas = result.get("metadatas", [])

        # no chunks found, the document is not stored
        if not ids:
            return []
        
        # delete all chunks
        self.vector_store.delete(ids=ids)

        return metadatas