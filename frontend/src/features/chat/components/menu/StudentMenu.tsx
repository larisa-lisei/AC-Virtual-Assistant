import './MenuComponent.css'
import { type Course } from '../../ChatPage'

interface StudentMenuProps {
    courses: Course[];
    selectedCourseId: string | null;
    onSelectedCourse: (courseId: string) => void;
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
            {courses.length === 0 ? (
                <p>No courses available.</p>
            ) : (
                courses.map((course) => (
                    <button 
                        key={course.id}
                        className={(course.id === selectedCourseId ? 'is-active' : '')}
                        onClick={() => onSelectedCourse(course.id)}
                        type="button"
                    >
                        {course.name}
                    </button>
                ))
            )}
            </nav>
        </aside>
    )
}