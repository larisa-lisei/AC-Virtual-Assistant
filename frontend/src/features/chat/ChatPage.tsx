import './ChatPage.css';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import LogoutIcon from '@mui/icons-material/Logout';
import  StudentMenu from './components/menu/StudentMenu';
import ProfessorMenu from './components/menu/ProfessorMenu';
import StudentChatComponent from './components/StudentChatComponent';
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import ProfessorChatComponent from './components/ProfessorChatComponent';
import AdminMenu from './components/menu/AdminMenu';
import AdminChatComponent from './components/AdminChatComponent';
import { Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { getErrorMessage } from '../../utils/error';

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
    teachingCoursesIds: number[];
}

export interface Course {
    id: number;
    title: string;
}

export interface AdminMenuOption {
    role: 'student' | 'professor';

    degree?: string;
    program?: string;
    year?: number;
    specialization?: string;

    // title displayed in chat header 
    title?: string;
    subtitle?:string;
}

export default function ChatPage() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const logoutMenuOpen = Boolean(anchorEl);
    const handleLogoutMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }
    const handleLogoutMenuClose = () => {
        setAnchorEl(null);
    }

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

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success"
    })

    const handleError = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: "error"
        });
    };

    const handleSuccess = (message: string) => {
        setSnackbar({
            open: true,
            message,
            severity: "success"
        });
    };

    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    //const [user, setUser] = useState<User>({role: 'student'});
    //const [user, setUser] = useState<Professor>({role: 'professor', teachingCoursesIds: [1, 3, 5]});
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [activeAdminItem, setActiveAdminItem] = useState<AdminMenuOption | null>(null);
    const [adminMenuData, setAdminMenuData] = useState<any>(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/auth/me`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                setUser({
                    role: data.role
                });
            } catch (error) {
                setUser(null);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchCurrentUser();

        const fetchAdminMenu = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/users/admin-menu`,
                    {
                        method: "GET",
                        credentials: "include"
                    }
                );

                if(!response.ok) {
                    const errorData = await response.json();
                    handleError(getErrorMessage(errorData))
                    return;
                }

                const data = await response.json();
                setAdminMenuData(data);
            } catch {
                handleError("Error fetching admin menu data.");
            }
        }

        fetchAdminMenu();
    }, []);
    
    if (loadingUser) {
        return <p>Loading...</p>;
    }

    if(!user) {
        return <p>You are not authenticated.</p>;
    }

    const handleLogout = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/auth/logout`, 
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                handleError(getErrorMessage(errorData));
                return;
            }

            navigate("/login");

        } catch (error) {
            handleError("Something went wrong.");
        }
    };

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

    const professorCourses =
    user.role === 'professor'
        ? courses //.filter(course => user.teachingCoursesIds.includes(course.id))
        : [];

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
            />
        ),
        professor: (
            <ProfessorMenu
                courses={professorCourses}
                selectedCourseId={selectedCourseId}
                onSelectedCourse={handleSelectedCourse}
            />
        ),
        admin: (
            <AdminMenu 
                activeButton={activeAdminItem}
                adminMenuData={adminMenuData}
                onSelectedAdminItem={handleAdminActiveItem}
                onError={handleError}
            />
        ),
    };

    const roleChats = {
        student: <StudentChatComponent selectedCourse={selectedCourse}/>,
        professor: <ProfessorChatComponent selectedCourse={selectedCourse} />,
        admin: <AdminChatComponent 
                    activeItem={activeAdminItem} 
                    adminMenuData={adminMenuData}
                    onError={handleError}
                    onSuccess={handleSuccess}
                />
    };

    return (
    <>
        <div className="chat-layout">
            <div className="chat-title">
                <h2>AC Virtual Assistant</h2>
                <div className="hello-username">
                    <h2>Hello, {user.role} </h2>

                    <button
                        type="button"
                        onClick={handleLogoutMenuClick}>
                        <PersonPinIcon sx={{ fontSize: 40 }} className = "profile-icon"/>
                    </button>

                    <Menu
                        anchorEl={anchorEl}
                        open={logoutMenuOpen}
                        onClose={handleLogoutMenuClose}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "center" }}
                        slotProps={{
                            paper: {
                                sx: {
                                    border: '2px solid #1B2058',
                                    borderRadius: 5,
                                    marginTop: -0.4
                                }
                            }
                        }}
                    >
                        <MenuItem 
                            onClick={handleLogout}
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'transparent'
                                }
                            }}
                        >
                            <div className='logout-item'>Logout <LogoutIcon></LogoutIcon></div>
                        </MenuItem>
                    </Menu>

                </div>
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
                {menuOpen && <div className="chat-overlay" onClick={onToggleMenu} />}
                    {roleChats[user.role]}
                </div>
            </div>
        </div>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right"
            }}
        >
            <Alert
                severity={snackbar.severity}
                onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    </>
    )
}