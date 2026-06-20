import type { ReactNode } from 'react';
import type { Course } from '../../../ChatPage'
import CourseConversationChat from './CourseConversationChat';

interface CourseFeedbackChatProps {
    selectedCourse: Course;

    renderHeader: (
        handleStartNewConversation: () => Promise<void>,
        isSending: boolean
    ) => ReactNode;
}

export default function CourseFeedbackChat({
    selectedCourse,
    renderHeader
}: CourseFeedbackChatProps) {
    return (
        <CourseConversationChat
            selectedCourse={selectedCourse}
            conversationMode='professor'
            showSources={false}
            inputPlaceholder='Get feedback for your courses...'
            renderHeader={renderHeader}
            emptyConversationState={
                <>
                    <h2>Welcome to AC Virtual Assistant ~ Professor View!</h2>
                    <p>Upload materials and let's help your students learn better!</p>
                </>
            }
        />
    )
}