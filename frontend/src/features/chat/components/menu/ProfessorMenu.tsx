import './MenuComponent.css'
import {Button} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import type { Course } from '../../ChatPage'

interface Professor {
    course: Course;
}

export default function ProfessorMenu() {
    return (
        <aside className="menu-container professor">
            <h2>Virtual Assistant Training</h2>

            <nav className="professor-menu-items">
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
            </nav>
        </aside>
    )
}