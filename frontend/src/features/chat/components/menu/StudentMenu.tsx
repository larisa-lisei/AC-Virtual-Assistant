import './MenuComponent.css'
import { type Course } from '../../ChatPage'

interface StudentMenuProps {
    courses: Course[];
    selectedCourseId: number | null;
    onSelectedCourse: (courseId: number) => void;
}

export default function StudentMenu({
    courses,
    selectedCourseId,
    onSelectedCourse,
}: StudentMenuProps) {
    return (
        <aside className="menu-container">
            <h2>Virtual Assistants</h2>

            <nav className="menu-items">
                {courses.map((course) => (
                    <button 
                        key={course.id}
                        className={(course.id === selectedCourseId ? 'is-active' : '')}
                        onClick={() => onSelectedCourse(course.id)}
                        type="button"
                    >
                        {course.title}
                    </button>
                ))}
            </nav>
        </aside>
    )
}