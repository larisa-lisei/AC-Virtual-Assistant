from .schemas import ProfessorChatResponse

class FeedbackService:
    def __init__(self, repository, llm_service):
        self.repository = repository
        self.llm_service = llm_service

    def log_student_question(self, course_id, course_name, question, answer_status, answer):
        answer_preview = self._extract_answer_preview(answer)
        return self.repository.save_question_log(
            course_id, 
            course_name,
            question, 
            answer_status,
            answer_preview
        )
    
    def _extract_answer_preview(self, answer):
        if not answer or not answer.strip():
            return None
        
        text = answer.strip()
        first_sentence = text.split(".")[0].strip()

        if not first_sentence:
            return text[:150]
        
        return first_sentence
    
    '''
    def _get_questions_for_course(self, course_id) -> list[QuestionLogResponse]:
        questions = self.repository.get_questions_for_course(course_id)

        return [
            QuestionLogResponse(
                id=str(item["_id"]),
                course_id=item["course_id"],
                course_name=item["course_name"],
                question=item["question"],
                answer_status=item["answer_status"],
                created_at=item["created_at"]
            )
            for item in questions
        ]
    '''
    
    def generate_professor_feedback(self, course_id, course_name, professor_question) -> ProfessorChatResponse:
        question_logs = self.repository.get_questions_for_course(course_id, limit=100)

        if not question_logs:
            return ProfessorChatResponse(
                answer="No student questions are available for this course yet."
            )
        
        prompt = self._build_feedback_prompt(course_name, question_logs, professor_question)

        feedback = self.llm_service.generate_answer(prompt)

        return ProfessorChatResponse(answer=feedback)
    

    def _build_feedback_prompt(self, course_name, question_logs: list[dict], professor_question):
        formatted_logs = self._format_questions_logs(question_logs)

        return f"""
You are an educational analytics assistant helping a professor improve their course.

Course:
{course_name}

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

Professor's question:
{professor_question}

Analyze these logs and provide feedback for the professor.
IMPORTANT: professors's questions can be analytitical or factual.

Rules:
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
- Only include at mos 2-3 examples IF strictly necessary.
- Prefer summarizing patterns instead of enumerating questions.

- Use the "no_relevant_docs" status to identify missing or insufficient course materials.
- Always respond in the same language as the professor's question.

""".strip()
    
    def _format_questions_logs(self, question_logs: list[dict]):
        formatted_logs: list[str] = []

        for index, log in enumerate(question_logs, start=1):
            formatted_logs.append(
                f"[Question {index} | status={log.get('answer_status')} | created_at={log.get('created_at')}]\n"
                f"Student question: {log.get('question')}\n"
                f"Answer preview: {log.get('answer_preview') or "No answer preview available."}"
            )

        return "\n\n".join(formatted_logs)