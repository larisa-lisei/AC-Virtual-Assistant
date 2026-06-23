from core.config import settings
from .schemas import ProfessorChatResponse
from features.conversations.enums import ConvType, ConvRole
from features.conversations.schemas import ConversationHistoryResponse

class FeedbackService:
    def __init__(self, repository, llm_service, course_service, conversation_service):
        self.repository = repository
        self.llm_service = llm_service
        self.course_service = course_service
        self.conv_service = conversation_service

    def log_student_question(self, course_id, course_name, question, answer_status, answer):
        answer_preview = self._extract_answer_preview(answer)
        return self.repository.save_question_log(
            course_id, 
            course_name,
            question, 
            answer_status,
            answer_preview
        )
    
    def generate_professor_feedback(self, course_id, professor_question, conversation_id, current_user) -> ProfessorChatResponse:
        course = self.course_service.ensure_professor_can_manage_course(current_user, course_id)
        course_name = course["name"]

        conversation_id = self.conv_service.get_or_create_conversation(
            conversation_id=conversation_id,
            user_id=current_user.id,
            course_id=course_id,
            course_name=course_name,
            conversation_type=ConvType.feedback

        )

        recent_messages = (
            self.conv_service.get_recent_messages(
                conversation_id=conversation_id,
                limit=settings.HISTORY_LIMIT
            )
        )

        question_logs = self.repository.get_questions_for_course(course_id, limit=100)

        if not question_logs:
            answer="No student questions are available for this course yet."

            self.conv_service.save_exchange(
                conversation_id=conversation_id,
                user_message=professor_question,
                assistant_message=answer
            )

            return ProfessorChatResponse(
                conversation_id=conversation_id,
                answer=answer
            )
        
        prompt = self._build_feedback_prompt(course_name, question_logs, recent_messages, professor_question)

        feedback = self.llm_service.generate_answer(prompt)

        self.conv_service.save_exchange(
            conversation_id=conversation_id,
            user_message=professor_question,
            assistant_message=feedback
        )

        return ProfessorChatResponse(
            conversation_id=conversation_id,
            answer=feedback
        )
    
    def get_active_feedback_conversation(self, course_id, current_user) -> ConversationHistoryResponse:
        self.course_service.ensure_professor_can_manage_course(current_user, course_id)
        return self.conv_service.get_active_conversation(
            user_id=current_user.id,
            course_id=course_id,
            conversation_type=ConvType.feedback,
            include_sources=False
        )
    
    def delete_active_feedback_conversation(self, course_id, current_user):
        self.course_service.ensure_professor_can_manage_course(current_user, course_id)
        self.conv_service.delete_active_conversation(
            user_id=current_user.id,
            course_id=course_id,
            conversation_type=ConvType.feedback
        )

    def _extract_answer_preview(self, answer):
        if not answer or not answer.strip():
            return None
        
        text = answer.strip()
        first_sentence = text.split(".")[0].strip()

        if not first_sentence:
            return text[:150]
        
        return first_sentence

    def _build_feedback_prompt(self, course_name, question_logs: list[dict], recent_messages, professor_question):
        formatted_logs = self._format_questions_logs(question_logs)
        formatted_history=self._format_conversation_history(recent_messages)

        return f"""
You are an educational analytics assistant helping a professor improve their course.

Course:
{course_name}

Previous feedback conversatiion:
{formatted_history}

Below is a list of anonymous student questions asked in this course.

Each log contains:
- the student question
- the answer status
- a short preview of the assistant's answer
- timestamp

Status meanings:
- "answered" = the system generated an answer
- "no_relevant_docs" = no relevant course material was found

Important interpretation rule:
A question with status "answered" is not always a successfully answered question.
Use the answer preview to decide whether the answer was actually useful.

Student question logs:
{formatted_logs}

CURRENT PROFESSOR QUESTION:
{professor_question}

Analyze these logs and provide feedback for the professor.
IMPORTANT: professors's questions can be analytitical or factual.

Rules:
- Use the previous feedback conversation only to understand follow-up references.
- First determine the type of the professor's question: analytical or factual, without mentioning the type in te answer.
- If FACTUAL: answer briefly, no analysis.
- If ANALYTICAL: analyze patterns and provide insights.
- Answer the professor's question using the student question logs.
- Identify patterns or group similar questions even if they are phrased differently.
- Distinguish between:
    1. questions that were properly answered
    2. questions with no relevant documents
    3. questions where documents were retrieved but the answer preview suggests insufficient context
- If the logs do not contain enough information to answer, say so clearly.
- Provide clear, structured, and actionable insights.

- NEVER list all questions.
- Only include at most 2-3 examples IF strictly necessary.
- Prefer summarizing patterns instead of enumerating questions.

- Use the "no_relevant_docs" status to identify missing or insufficient course materials.
- NEVER mention internal log identifiers or metadata in the answer.
- You MUST ALWAYS answer in the same language as the CURRENT PROFESSOR QUESTION.

Language rules:
- You MUST answer in the same language as the CURRENT STUDENT QUESTION.
- This rule also applies in hints-only mode.
- Determine the response language ONLY from the CURRENT STUDENT QUESTION.

Formatting rules:
- Format the answer using standard Markdown.
- Do NOT use LaTeX syntax or LaTeX delimiters.
- Do NOT use expressions such as `$...$`, `$$...$$`, `\frac`, `\sqrt`, `\Delta`, `\times`, `\pm`, or `\neq`.
- Write mathematical expressions using plain text and readable Unicode symbols.
""".strip()
    
    def _format_questions_logs(self, question_logs: list[dict]):
        formatted_logs: list[str] = []

        for index, log in enumerate(question_logs, start=1):
            answer_preview = (
                log.get("answer_preview")
                or "No answer preview available."
            )
            formatted_logs.append( 
                "<student_question_log>\n" 
                f"Timestamp: {log.get('created_at')}\n" 
                f"Internal answer status: {log.get('answer_status')}\n" 
                f"Student question: {log.get('question')}\n" 
                f"Answer preview: {answer_preview}\n" 
                "</student_question_log>" 
            )

        return "\n\n".join(formatted_logs)
    
    def _format_conversation_history(self, messages: list[dict]):
        if not messages:
            return "No previous feedback conversation."
        
        formatted_messages: list[str] = []

        for message in messages:
            sender = message.get("sender", ConvRole.user.value)
            sender_label = (
                "Professor"
                if sender == ConvRole.user.value
                else "Assistant"
            )

            content = message.get("content", "")

            formatted_messages.append(f"{sender_label}: {content}")

        return "\n".join(formatted_messages)