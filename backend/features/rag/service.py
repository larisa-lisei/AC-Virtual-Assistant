import os
import shutil
import uuid
from core.config import settings

from fastapi import UploadFile
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from features.users.schemas import UserRole
from features.courses.exceptions import CourseAccessDeniedError
from features.conversations.enums import ConvRole, ConvType
from features.conversations.schemas import ConversationHistoryResponse

from .schemas import (
    DocumentUploadResponse,
    ChatResponse,
    SourceChunk
)
from .exceptions import (
    InvalidDocumentError,
    DocumentProcessingError,
    DocumentNotFoundError

)

class RagService:
    def __init__(self, rag_repository, llm_service, feedback_service, course_service, conversation_service):
        self.repository = rag_repository
        self.llm_service = llm_service
        self.feedback_service = feedback_service
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=75
        )
        self.course_service = course_service
        self.conv_service = conversation_service


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

            file_saved = True
            
            loader = PyPDFLoader(file_path)
            raw_documents = loader.load()

            if not raw_documents:
                raise InvalidDocumentError("No readable text found in PDF.")
            
            # split into chunks 
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
                    metadata["page"] = int(metadata["page"]) + 1

                final_documents.append(
                    Document(
                        page_content=doc.page_content,
                        metadata=metadata
                    )
                )
                ids.append(f"{doc_id}_chunk_{index}")

            # embedding
            self.repository.add_documents(final_documents, ids)

            return DocumentUploadResponse(
                doc_id=doc_id,
                filename=original_filename,
                chunks_indexed=len(final_documents)
            )
        except InvalidDocumentError:
            if file_saved and os.path.exists(file_path):
                os.remove(file_path)
            raise
        except Exception:
            if file_saved and os.path.exists(file_path):
                os.remove(file_path)
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

    def _get_course_for_current_user(self, current_user, course_id):
        if current_user.role == UserRole.student.value:
            course = self.course_service.ensure_student_can_access_course(current_user, course_id)
        elif current_user.role == UserRole.professor.value:
            course = self.course_service.ensure_professor_can_manage_course(current_user, course_id)
        else:
            raise CourseAccessDeniedError()
        return course

    def answer_question(
        self,
        course_id: str,
        question: str,
        current_user,
        conversation_id: str | None
    ) -> ChatResponse:
        course = self._get_course_for_current_user(current_user, course_id)

        course_name = course["name"]
        hints_only = course.get("hints_only", False)

        conversation_id = self.conv_service.get_or_create_conversation(
            conversation_id=conversation_id,
            user_id=current_user.id,
            course_id=course_id,
            course_name=course_name,
            conversation_type=ConvType.course_assistant
        )

        recent_messages = self.conv_service.get_recent_messages(conversation_id, limit=settings.HISTORY_LIMIT)

        retrieval_query = self._build_retrieval_query(question, recent_messages)
        
        retrieved_docs = self._retrieve_relevant_documents(
            course_id=course_id,
            question=retrieval_query,
        )

        if not retrieved_docs:
            answer = "No relevant course materials were found."

            # save messages for history
            self.conv_service.save_exchange(
                conversation_id=conversation_id,
                user_message=question,
                assistant_message=answer
            )

            # only student messages are used for feedback analysis
            if current_user.role == UserRole.student.value:
                self.feedback_service.log_student_question(
                    course_id,
                    course_name,
                    question,
                    answer_status="no_relevant_docs",
                    answer=None
                )
           
            return ChatResponse(
               conversation_id=conversation_id,
               answer=answer,
               sources=[]
           )

        prompt = self._build_prompt(
            course_name=course_name,
            question=question,
            retrieved_docs=retrieved_docs,
            recent_messages=recent_messages,
            hints_only=hints_only
        )

        answer = self.llm_service.generate_answer(prompt)

        sources = [
            SourceChunk(
                content=doc.page_content,
                page=doc.metadata.get("page"),
                filename=doc.metadata.get("filename"),
                chunk_index=doc.metadata.get("chunk_index")
            ) 
            for doc, _ in retrieved_docs
        ]

        # only store sources in history for professors
        history_sources = None

        if current_user.role == UserRole.professor.value:
            history_sources = [
                {
                    "filename": source.filename,
                    "page": source.page,
                    "chunk_index": source.chunk_index,
                    "content": source.content
                }
                for source in sources
            ]

        self.conv_service.save_exchange(
            conversation_id=conversation_id,
            user_message=question,
            assistant_message=answer,
            sources=history_sources
        )

        # only student messages are use for feedback analysis
        if current_user.role == UserRole.student.value:
            self.feedback_service.log_student_question(
                course_id,
                course_name,
                question,
                answer_status="answered",
                answer=answer
            )

        # only professors receive the extracted fragments sources
        visible_sources = (
            sources
            if current_user.role == UserRole.professor.value
            else []
        )

        return ChatResponse(
            conversation_id=conversation_id,
            answer=answer,
            sources=visible_sources
        )
    
    def get_active_conversation(self, course_id, current_user) -> ConversationHistoryResponse:
        self._get_course_for_current_user(current_user, course_id)
        include_sources = current_user.role == UserRole.professor.value
        return self.conv_service.get_active_conversation(
            user_id=current_user.id,
            course_id=course_id,
            conversation_type=ConvType.course_assistant,
            include_sources=include_sources
        )
    
    def delete_active_conversation(self, course_id, current_user):
        self._get_course_for_current_user(current_user, course_id)
        self.conv_service.delete_active_conversation(
            user_id=current_user.id,
            course_id=course_id,
            conversation_type=ConvType.course_assistant
        )

    def _build_retrieval_query(self, question, recent_messages: list[dict]):
        if not recent_messages:
            return question
        history = self._format_conversation_history(recent_messages)

        return f"""
    Conversation history:
    {history}

    Current question:
    {question}
    """.strip()

    def _format_conversation_history(self, messages: list[dict]):
        if not messages:
            return "No previous conversation."
        
        formatted_messages: list[str] = []

        for message in messages:
            sender = message.get("sender", ConvRole.user.value)
            content = message.get("content", "")
            formatted_messages.append(f"{sender}: {content}")

        return "\n".join(formatted_messages)
    
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

    def _build_prompt(
        self,
        course_name: str,
        question: str,
        retrieved_docs: list[Document],
        recent_messages: list[dict],
        hints_only: bool
    ):
        context = self._format_context(retrieved_docs)
        conversation_history = self._format_conversation_history(recent_messages)

        exercise_guidance = (
            """ 
Hints-only mode is ENABLED.

When the current question asks for the solution of an exercise, problem,
calculation, proof, implementation task, coding or practical assignment:

- Do NOT provide the complete solution.
- Do NOT provide the final numerical result.
- Do NOT write the complete final proof.
- Do NOT provide complete executable code that directly solves the task.
- Provide progressiv hints that guide the student toward the solution.
- Start with the smallest useful hint.
- Explain which concept, formula, theorem, algorithm, or course section the student shoul use.
- Prefer guiding questions over direct answers.
- Encourage the student to attempt the next step.
- Reveal additional steps only when the student asks for another hint.
- If the student submits an attempted solution, evaluate it and indicate what should be corrected without replacing it with a complete solution.

Hints-only mode applies only to exercises and tasks requiring a solution.
For conceptual questions, definitions, explanations, and course information,
answer normally and completely.
"""
    if hints_only
    else
    """ 
Hints-only is DISBALED.

You may provide complete explanations and complete solutions when they are
supported by the COURSE CONTEXT.
"""
        )

        return rf"""
You are a virtual assistant specialized in the course "{course_name}".

Your role is to help students understand the course materials using the provided COURSE CONTEXT.

You receive:
    1. the previous conversation between the student and the assistant;
    2. course context extracted from documents uploaded by the professor;
    3. the student's current question.

Conversation rules:
- First examine only the CONVERSATION HISTORY and the CURRENT STUDENT QUESTION.
- Use the conversation history only to understand follow-up questions and references.
- Do not use conversation history as proof for factual information unless it is supported by the course context.
- IMPORTANT: If there is no previous conversation and the current question depends on an earlier message, ask the student for clarification and stop.
- If multiple interpretations are possible, ask which concept or operation the student is referring to.    

Rules:
- Answer only based on the provided COURSE CONTEXT.
- If the course context is insufficient, clearly say that the information is not available in the course materials.
- If the course context does not provide a complete list when the student asks for one, say that the list may be incomplete.
- Do not invent information.
- Explain clearly and simply, in a structured way suitable for students.
- Break down complex ideas step by step when helpful.
- If a source chunk is clearly unrelated to the question, ignore it entirely.
- When you use information from a course context chunk, mention the document name and page naturally, for example: (AlPD_cursuri.pdf, p. 25).
- Do not copy raw course context labels such as "Context chunk", "Document:", "Page:", or "[Source ...]" into the answer.
- Do not repeat the same document and page reference multiple times within the same paragraph or list.

Language rules:
- You MUST answer in the same language as the CURRENT STUDENT QUESTION.
- This rule also applies in hints-only mode.
- Determine the response language ONLY from the CURRENT STUDENT QUESTION.

Formatting rules:
- Format the answer using standard Markdown.
- Do NOT use LaTeX syntax or LaTeX delimiters.
- Do NOT use expressions such as `$...$`, `$$...$$`, `\frac`, `\sqrt`, `\Delta`, `\times`, `\pm`, or `\neq`.
- Write mathematical expressions using plain text and readable Unicode symbols.

Exercise assistance rules:
{exercise_guidance}

CONVERSATION HISTORY:
{conversation_history}

COURSE CONTEXT:
{context}

CURRENT STUDENT QUESTION:
{question}

Answer:
""".strip()

        