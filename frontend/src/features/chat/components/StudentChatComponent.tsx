import './chatComponent.css';
import type { Course } from '../ChatPage';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { IconButton, Tooltip } from '@mui/material';
import CourseAssistantChat from './utils/conversations/CourseAssistantChat';

interface StudentChatComponentProps {
    selectedCourse?: Course;
}

export default function StudentChatComponent({ selectedCourse }: StudentChatComponentProps) {
    return (
        <CourseAssistantChat
            selectedCourse={selectedCourse}
            showSources={false}
            renderHeader={(
                handleStartNewConversation,
                isSending
            ) => (
                selectedCourse ? (
                    <div className="course-title">
                        <h3>{selectedCourse.name}</h3>

                        <Tooltip title="Start new conversation">
                            <IconButton
                                type="button"
                                className='new-chat-button'
                                onClick={handleStartNewConversation}
                                disabled={isSending}
                            >
                                <AddCommentIcon />
                            </IconButton>
                        </Tooltip>
                    </div>
                ) : null
            )}
        />
    )
}
