import type { ReactNode } from 'react';
import type { Course } from '../../../ChatPage'
import CourseConversationChat from './CourseConversationChat';

interface CourseAssistantChatProps {
    selectedCourse?: Course;
    showSources: boolean;
    isProfessorTesting?: boolean;

    renderHeader?: (
        handelStartNewConversation: () => Promise<void>,
        isSending: boolean
    ) => ReactNode;
}

export default function CourseAssistantChat({
    selectedCourse,
    showSources,
    isProfessorTesting = false,
    renderHeader
}: CourseAssistantChatProps) {
    return (
        <CourseConversationChat
            selectedCourse={selectedCourse}
            conversationMode='student'
            showSources={showSources}
            inputPlaceholder='Type here...'
            renderHeader={renderHeader}
            emptyConversationState={
                isProfessorTesting ? (
                    /* Message for professor's student view */
                    <>
                        <h2>Welcome to AC Virtual Assistant ~ Student View!</h2>
                        <p>Get the same answers your students receive.</p>
                    </>
                ) : (
                    /* Message for student */
                    <h2>Ask me anything about this course!</h2>
                )
            }
        />
    )

}