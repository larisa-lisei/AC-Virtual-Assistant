import './MenuComponent.css'
import {Button} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import type { Course } from '../../ChatPage'

interface ProfessorMenuProps {
    courses: Course[];
    selectedCourseId: string | null;
    onSelectedCourse: (courseId: string) => void;
}

export default function ProfessorMenu({
    courses,
    selectedCourseId,
    onSelectedCourse
}: ProfessorMenuProps) {
    return (
        <aside className="menu-container professor">
            <h2>Virtual Assistant Training</h2>

            <nav>
                <div className="professor-menu-items">
                    <Button
                        type="button"
                        variant="contained">
                            Upload PDF
                    </Button>
                    <Button
                        type="button"
                        variant="contained">
                            Delete PDF
                    </Button>
                    <div className="professor-hints-item">
                        Hints only <Checkbox />
                    </div>
                </div>
                <div className="menu-items professor-menu-courses">
                    <h3>Courses:</h3>
                    {courses.length === 0? (
                        <p>No course assigned.</p>
                    ): (
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
                </div>
            </nav>
        </aside>
    )
}