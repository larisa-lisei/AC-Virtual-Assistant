import { IconButton, Switch, Tooltip } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import './ChatComponent.css'
import { useState } from 'react';
import type { Course } from '../ChatPage';
import CourseFeedbackChat from './utils/conversations/CourseFeedbackChat';
import CourseAssistantChat from './utils/conversations/CourseAssistantChat';

export type ConvMode = 'professor' | 'student';

interface ProfessorChatComponentProps {
    selectedCourse?: Course;
}

export default function ProfessorChatComponent({selectedCourse}:ProfessorChatComponentProps) {
    const [convMode, setConvMode] =  useState<ConvMode>('professor');

    /* same welcome message for professor view */
    if(!selectedCourse) {
        return (
            <div className="chat-component-container">
                <div className="chat-description">
                    <h2>Welcome to Ac Virtual Assistant!</h2>
                    <p>Select one of your courses and let's get started!</p>
                </div>
            </div>
        )
    }

    const renderHeader = (
        handleStartNewConversation: () => Promise<void>,
        isSending: boolean
    ) => (
        <div className="course-title professor">
            <div className="title-new-conv">
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
            <div className="switch-button">
                <span>Professor</span>
                <Switch 
                    className='chat-icon'
                    checked={convMode === 'student'}
                    onChange={(e) => setConvMode(e.target.checked ? 'student' : 'professor')}
                    sx={{fontSize: 40}}/>
                <span>Student</span>
            </div>
        </div>
    );
           
    return convMode === 'professor' ? (
        <CourseFeedbackChat
            selectedCourse={selectedCourse}
            renderHeader={renderHeader}
        />
    ) : (
        <CourseAssistantChat
            selectedCourse={selectedCourse}
            showSources={true}
            isProfessorTesting={true}
            renderHeader={renderHeader}
        />
    );
}