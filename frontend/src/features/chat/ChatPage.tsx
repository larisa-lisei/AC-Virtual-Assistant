import './ChatPage.css';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import  StudentMenu from './components/menu/StudentMenu';
import ProfessorMenu from './components/menu/ProfessorMenu';
import StudentChatComponent from './components/StudentChatComponent';
import { useState } from 'react';
import ProfessorChatComponent from './components/ProfessorChatComponent';
import AdminMenu from './components/menu/AdminMenu';
import AdminChatComponent from './components/AdminChatComponent';

type MessageRole = 'user' | 'assistant';
type UserRole = 'student' | 'professor' | 'admin';

export interface Message {
    id: string;
    role: MessageRole;
    text: string;
}

export interface User {
    //id: number;
    //name: string;
    role: UserRole;
}

export interface Student extends User {
    role: 'student';
    enrolledCoursesIds: number[];
}

export interface Professor extends User {
    role: 'professor';
    courseId: number;
}

export interface Course {
    id: number;
    title: string;
}

export interface AdminMenuOption {
    degree: string;
    program: string;
    specific: string;
}

export default function ChatPage() {
    const username = ' username';

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

    //const [user, setUser] = useState<User>({role: 'student'});
    //const [user, setUser] = useState<User>({role: 'professor'});
    const [user, setUser] = useState<User>({role: 'admin'});

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

    const [activeAdminItem, setActiveAdminItem] = useState<AdminMenuOption | null>(null);

    const handleAdminActiveItem = (clickedItem: AdminMenuOption) => {
        setActiveAdminItem(clickedItem);
    }

    const onToggleMenu = () => {
        setMenuOpen((e) => !e)
    }

    const roleMenus = {
        student: (
            <StudentMenu
                courses={courses}
                selectedCourseId={selectedCourseId}
                onSelectedCourse={handleSelectedCourse}
                onToggleMenu={onToggleMenu}
                menuOpen={menuOpen}
            />
        ),
        professor: <ProfessorMenu />,
        admin: (
            <AdminMenu 
                activeButton={activeAdminItem}
                onSelectedAdminItem={handleAdminActiveItem}
            />
        ),
    };

    const roleChats = {
        student: <StudentChatComponent selectedCourse={selectedCourse}/>,
        professor: <ProfessorChatComponent />,
        admin: <AdminChatComponent activeItem={activeAdminItem} />
    };

    return (
        <div className="chat-layout">
            <div className="chat-title">
                <h2>AC Virtual Assistant</h2>
                <h2 className="hello-student">Hello, {username} <PersonPinIcon sx={{ fontSize: 40 }} className = "profile-icon"/></h2>
            </div>
            <div className="chat-container">
                <div className={`chat-menu ${menuOpen ? 'open' : 'closed'}`}>
                    <div className="chat-menu-panel">
                        {roleMenus[user.role]}
                    </div>

                    <button className = {`menu-button ${menuOpen ? 'open' : 'closed'}`} type = "button" onClick={onToggleMenu}>
                        {menuOpen ? 
                            <ArrowCircleLeftIcon fontSize='large' /> :
                            <ArrowCircleRightIcon fontSize='large' />
                        }
                    </button>
                </div>
                <div className={`chat-messages ${menuOpen ? 'menu-open' : 'menu-close'}`}>
                    {roleChats[user.role]}
                </div>
            </div>
        </div>
    )
}