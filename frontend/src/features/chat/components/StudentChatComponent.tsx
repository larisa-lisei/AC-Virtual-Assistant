import './chatComponent.css';
import type { Course } from '../ChatPage';
import SendIcon from '@mui/icons-material/Send';

interface StudentChatComponentProps {
    selectedCourse?: Course;
}

export default function ChatComponent({ selectedCourse }: StudentChatComponentProps) {
    //no course selected - welcome message
    if (!selectedCourse) {
        return (
            <div className="chat-component-container">
                <div className="chat-description">
                    <h2>Welcome to AC Virtual Assistant!</h2>
                    <p>Pick a virtual assistant and let's get started!</p>
                </div>
            </div>
        )
    }

    return (
        <div className="chat-component-container">
            <div className="course-title">
                <h3>{selectedCourse.title}</h3>
            </div>
            <div className="chat-description">
                <h2>Ask me anything about this course!</h2>
            </div>
            <div className="input-text">
                <div className="input-wrapper">
                    <input type="text" placeholder="Type here..."/>
                    <SendIcon className="input-icon"/>
                </div>
            </div>
        </div>
    )
}