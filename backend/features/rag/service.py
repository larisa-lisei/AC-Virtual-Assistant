import os
import shutil
import uuid

from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .schemas import (
    DocumentUploadResponse,
    ChatResponse,
    SourceChunk
)
from .exceptions import (
    InvalidDocumentError,
    DocumentProcessingError,
    NoRelevantDocsError,
    DocumentNotFoundError
)
from core.config import settings

class RagService:
    def __init__(self, rag_repository, llm_service, feedback_service, course_service):
        self.repository = rag_repository
        self.llm_service = llm_service
        self.feedback_service = feedback_service
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=75
        )
        self.course_service = course_service


    def upload_document(self, course_id: str, file: UploadFile, current_user) -> DocumentUploadResponse:
        course = self.course_service.get_course_by_id(course_id)

        self.course_service.ensure_professor_can_manage_course(
            current_user = current_user,
            course_id = course_id
        )

        if not file.filename:
            raise InvalidDocumentError("Missing filename.")
        
        original_filename = os.path.basename(file.filename)
        
        if not original_filename.lower().endswith('.pdf'):
            raise InvalidDocumentError("Only PDF files are allowed.")
        
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

        # Save the uploaded file to disk with unique name
        stored_filename = f"{uuid.uuid4()}_{original_filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            loader = PyPDFLoader(file_path)
            raw_documents = loader.load()

            if not raw_documents:
                raise InvalidDocumentError("No readable text found in PDF.")
            
            # split into chunks for better embedding and retrieval performance
            split_documents = self.text_splitter.split_documents(raw_documents)

            if not split_documents:
                raise InvalidDocumentError("PDF could not be split into valid text chunks.")
            
            # unique document ID for all chunks of this document
            doc_id = str(uuid.uuid4())
            # documents for the vector database
            final_documents: list[Document] = []
            # unique id for each chunk
            ids: list[str] = []

            for index, doc in enumerate(split_documents):
                # get existing metadata and add more info
                metadata = dict(doc.metadata or {})
                metadata["course_id"] = course_id
                metadata["course_name"] = course["name"]
                metadata["doc_id"] = doc_id

                # shown in rag answers and source list
                metadata["filename"] = original_filename

                # used internally to delete physical file
                metadata["stored_filename"] = stored_filename

                metadata["chunk_index"] = index

                if "page" in metadata and metadata["page"] is not None:
                    metadata["page"] = int(metadata["page"])

                final_documents.append(
                    Document(
                        page_content=doc.page_content,
                        metadata=metadata
                    )
                )
                ids.append(f"{doc_id}_chunk_{index}")

            self.repository.add_documents(final_documents, ids)

            return DocumentUploadResponse(
                doc_id=doc_id,
                filename=original_filename,
                chunks_indexed=len(final_documents)
            )
        
        except InvalidDocumentError:
            raise
        except Exception:
            raise DocumentProcessingError(file.filename)
        finally:
            file.file.close()

    def get_uploaded_documents(self, course_id: str, current_user) -> list[DocumentUploadResponse]:
        self.course_service.get_course_by_id(course_id)

        self.course_service.ensure_professor_can_manage_course(
            current_user=current_user,
            course_id=course_id
        )

        documents = self.repository.get_uploaded_documents_by_course(course_id)

        return [
            DocumentUploadResponse(
                doc_id=document["doc_id"],
                filename=document["filename"],
                chunks_indexed=document["chunks_indexed"]
            )
            for document in documents
        ]
    
    def delete_document(self, course_id, doc_id, current_user):
        self.course_service.get_course_by_id(course_id)

        self.course_service.ensure_professor_can_manage_course(
            current_user=current_user,
            course_id=course_id
        )

        deleted_metadatas = self.repository.delete_document_by_course(course_id, doc_id)

        if not deleted_metadatas:
            raise DocumentNotFoundError(doc_id)
        
        # extract real filename stored on disk to delete physical file
        stored_filenames = {
            metadata.get("stored_filename")
            for metadata in deleted_metadatas
            if metadata and metadata.get("stored_filename")
        }

        for stored_filename in stored_filenames:
            file_path = os.path.join(settings.UPLOAD_DIR, os.path.basename(stored_filename))
            # delete physical file 
            if os.path.exists(file_path):
                os.remove(file_path)

    def answer_question(
        self,
        course_id: str,
        question: str,
    ) -> ChatResponse:
        course = self.course_service.get_course_by_id(course_id)
        
        retrieved_docs = self._retrieve_relevant_documents(
            course_id=course_id,
            question=question,
        )

        course_name = course["name"]

        if not retrieved_docs:
            self.feedback_service.log_student_question(
                course_id,
                course_name,
                question,
                answer_status="no_relevant_docs",
                answer=None
            )
            raise NoRelevantDocsError()

        prompt = self._build_prompt(
            course_name=course_name,
            question=question,
            retrieved_docs=retrieved_docs
        )

        answer = self.llm_service.generate_answer(prompt)

        self.feedback_service.log_student_question(
            course_id,
            course_name,
            question,
            answer_status="answered",
            answer=answer
        )

        sources = [
            SourceChunk(
                content=doc.page_content,
                page=doc.metadata.get("page"),
                filename=doc.metadata.get("filename"),
                chunk_index=doc.metadata.get("chunk_index")
            ) 
            for doc, _ in retrieved_docs
        ]

        return ChatResponse(
            answer=answer,
            sources=sources
        )
    

    def _retrieve_relevant_documents(
        self,
        course_id: str,
        question: str,
    ) -> list[tuple[Document, float]]:
        return self.repository.similarity_search_by_course(
            query=question,
            course_id=course_id,
            relevant_chunks=settings.DEFAULT_RELEVANT_CHUNKS,
            score_threshold=settings.RAG_SCORE_THRESHOLD
        )
    

    def _build_prompt(
        self,
        course_name: str,
        question: str,
        retrieved_docs: list[Document]
    ):
        context = self._format_context(retrieved_docs)

        return f"""
You are a virtual assistant specialized in the course "{course_name}".

Your role is to help students understand the course materials using the provided context.

You will be given context extracted from documents uploaded by the professor for this course.

Rules:
- Answer only based on the provided context.
- If the context is insufficient, clearly say that the information is not available in the course materials.
- Do not invent information.
- Explain clearly and simply, in a structured way suitable for students.
- Break down complex ideas step by step when helpful.
- When relevant, mention the source document and page.
- If a source chunk is clearly unrelated to the question, ignore it entirely.
- Always respond in the same language as the student's question.

Context:
{context}

Student question:
{question}

Answer:
""".strip()
    

    def _format_context(self, retrieved_docs: list[tuple[Document, float]]):
        if not retrieved_docs:
            return "No relevant course context was found."
        
        formatted_chunks: list[str] = []

        for index, (doc, _) in enumerate(retrieved_docs, start=1):
            page = doc.metadata.get("page")
            filename = doc.metadata.get("filename")

            formatted_chunks.append(
                f"[Source {index} | filename={filename} | page={page}]\n{doc.page_content}"
            )

        return "\n\n".join(formatted_chunks)

        