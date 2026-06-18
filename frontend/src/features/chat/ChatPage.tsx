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
    id: string;
    email: string;
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

export type Course = {
    id: string;
    name: string;
    degree: string;
    program: string;
    year: number;
    specialization?: string | null
};

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

    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
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
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [activeAdminItem, setActiveAdminItem] = useState<AdminMenuOption | null>(null);
    const [adminMenuData, setAdminMenuData] = useState<any>(null);

    const fetchCourses = async(role: string) => {
        const endpoint =
            role === "professor"
                ? `${API_BASE_URL}/courses/teaching`
                : `${API_BASE_URL}/courses/learning`;

        try {
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include"
            });

            if(!response.ok) {
                const errorData = await response.json();
                handleError(getErrorMessage(errorData));
                setCourses([]);
                return;
            }

            const data: Course[] = await response.json();
            setCourses(data);
        } catch {
            handleError("Something went wrong.");
            setCourses([]);
        }
    }

    useEffect(() => {
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
        };

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
                    const errorData = await response.json();
                    handleError(getErrorMessage(errorData))
                    setUser(null);
                    return;
                }

                const data = await response.json();

                setUser({
                    id: data.id,
                    email: data.email,
                    role: data.role
                });

                if (data.role === "admin") {
                    await fetchAdminMenu();
                }

                if(data.role === "professor" || data.role === "student") {
                    await fetchCourses(data.role);
                }

            } catch (error) {
                handleError("Something went wrong.")
                setUser(null);
            } finally {
                setLoadingUser(false);
            }
        };

        fetchCurrentUser();

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

    const handleSelectedCourse = (courseId: string) => {
        if(selectedCourseId === courseId) {
            return;
        }

        setSelectedCourseId(courseId);

        //new chat for this course whenever different course is clicked
        setMessages([]);
        setConversationId(null);
    }

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
                courses={courses}
                selectedCourseId={selectedCourseId}
                onSelectedCourse={handleSelectedCourse}
                onError={handleError}
                onSuccess={handleSuccess}
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