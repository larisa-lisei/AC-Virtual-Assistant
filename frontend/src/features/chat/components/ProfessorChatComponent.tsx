import { Switch } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './ChatComponent.css'
import { useState } from 'react';
import type { Course } from '../ChatPage';

type ConvMode = 'professor' | 'student';

interface ProfessorChatComponentProps {
    selectedCourse?: Course;
}

export default function ProfessorChatComponent({selectedCourse}:ProfessorChatComponentProps) {
    const [convMode, setConvMode] =  useState<ConvMode>('professor');

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

    return (
            <div className="chat-component-container">
                <div className="course-title professor">
                    <h3>{selectedCourse.title}</h3>
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
                <div className="chat-description">
                    { convMode === 'professor' ? (
                    <>
                    <h2>Welcome to AC Virtual Assistant ~ Professor View!</h2>
                    <p>Upload materials and let's help your students learn better!</p> 
                    </>  
                    ) : (
                        <>  
                        <h2>Welcome to AC Virtual Assistant ~ Student View!</h2>
                        <p>Get the same answers your student receive.</p>   
                        </>
                    )}
                </div>
                <div className="input-text">
                    <div className="input-wrapper">
                        <input type="text" placeholder={
                                            convMode === 'professor' ? 
                                            "Get feedback for your course..."
                                            : "Type here..."}/>
                        <SendIcon className="input-icon"/>
                    </div>
                </div>
            </div>
        )
}