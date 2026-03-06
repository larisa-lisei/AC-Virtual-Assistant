import { Switch } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './ChatComponent.css'
import { useState } from 'react';

type ConvMode = 'professor' | 'student';

export default function ProfessorChatComponent() {
    const [convMode, setConvMode] =  useState<ConvMode>('professor');

    return (
            <div className="chat-component-container">
                <div className="course-title professor">
                    <h3>Course Title</h3>
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
                <div className="message-input">
                <div className="message-wrapper">
                    <input type="text" placeholder={
                                        convMode === 'professor' ? 
                                        "Get feedback for your course..."
                                        : "Type here..."}/>
                    <SendIcon className="send-icon"/>
                </div>
            </div>
            </div>
        )
}