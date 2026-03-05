import './ChatPage.css';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import  StudentMenu, { type Course } from './components/menu/StudentMenu';
import ChatComponent from './components/ChatComponent';
import { useState } from 'react';

type MessageRole = 'user' | 'assistant';

interface Message {
    id: string;
    role: MessageRole;
    text: string;
}

export default function ChatPage() {
    const studentName = 'student name';

    const courses: Course[] = [
        { id: 1, title: 'Parallel and Distributed Algorithms' },
        { id: 2, title: 'Artificial Intelligence' },
        { id: 3, title: 'Web Application Development' },
        { id: 4, title: 'Mobile Application Development' },
        { id: 5, title: 'Service-Oriented Programming' }
    ];

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const[menuOpen, setMenuOpen] = useState(true);

    const selectedCourse = selectedCourseId !== null
        ? courses.find(
            (course) => course.id === selectedCourseId
        )
        : undefined;

    const handleSelectedCourse = (courseId: number) => {
        if(selectedCourseId !== courseId) {
            setSelectedCourseId(courseId);
            setMessages([]); // new chat when another course is selected
        }
    }

    const onToggleMenu = () => {
        setMenuOpen((v) => !v)
    }

    return (
        <div className="chat-layout">
            <div className="chat-title">
                <h2>AC Virtual Assistant</h2>
                <h2 className="hello-student">Hello, {studentName} <PersonPinIcon sx={{ fontSize: 40 }} className = "profile-icon"/></h2>
            </div>
            <div className="chat-container">
                <div className={`chat-menu ${menuOpen ? 'open' : 'closed'}`}>
                    <div className="chat-menu-panel">
                        <StudentMenu
                            courses={courses}
                            selectedCourseId={selectedCourseId}
                            onSelectedCourse={handleSelectedCourse}
                            onToggleMenu={onToggleMenu}
                            menuOpen={menuOpen}
                        />
                    </div>

                    <button className = {`menu-button ${menuOpen ? 'open' : 'closed'}`} type = "button" onClick={onToggleMenu}>
                        {menuOpen ? 
                            <ArrowCircleLeftIcon fontSize='large' /> :
                            <ArrowCircleRightIcon fontSize='large' />
                        }
                    </button>
                </div>
                <div className={`chat-messages ${menuOpen ? 'menu-open' : 'menu-close'}`}>
                    <ChatComponent selectedCourse={selectedCourse}/>
                </div>
            </div>
        </div>
    )
}