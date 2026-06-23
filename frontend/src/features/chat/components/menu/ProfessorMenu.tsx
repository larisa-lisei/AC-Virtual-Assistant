import './MenuComponent.css';
import { useRef, useState } from 'react';
import { Button, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import type { Course } from '../../ChatPage'
import { getErrorMessage } from '../../../../utils/error';
import BaseDialog from '../utils/admin/BaseDialog';

interface ProfessorMenuProps {
    courses: Course[];
    selectedCourseId: string | null;
    onSelectedCourse: (courseId: string) => void;
    onHintsOnlyChanged: (courseId: string, hintsOnly: boolean) => void;
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

interface UploadedDocument {
    doc_id: string;
    filename: string;
    chunks_indexed: number;
}

export default function ProfessorMenu({
    courses,
    selectedCourseId,
    onSelectedCourse,
    onHintsOnlyChanged,
    onError,
    onSuccess
}: ProfessorMenuProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

    const [isUpdatingHints, setIsUpdatedHints] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

    const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
    ) ?? null;

    const handleUploadClick = () => {
        if(!selectedCourse) {
            onError('Please select a course before uploading a PDF.');
            return;
        }

        fileInputRef.current?.click();
    };

    const handlePdfSelected = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if(!file) {
            return;
        }

        if(!selectedCourse) {
            onError('Please select a course before uploading a PDF.');
            return;
        }

        const isPdf = 
            file.type === 'application/pdf' ||
            file.name.toLocaleLowerCase().endsWith('.pdf');

        if (!isPdf) {
            onError('Only PDF files are allowed.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
    
            const response = await fetch (`${API_BASE_URL}/courses/${selectedCourse.id}/documents`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            const data = await response.json();

            onSuccess(
                `PDF uploaded successfully. ${data.chunks_indexed} chunks indexed.`
            );
        } catch {
            onError("Something went wrong while uploading the PDF.");
        } finally {
            setIsUploading(false)
        }
    }

    const fetchUploadedDocuments = async () => {
        if(!selectedCourse) {
            onError('Please select a course first.');
            return;
        }

        try {
            setIsLoadingDocuments(true);

            const response = await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/documents`,
                {
                    method: 'GET',
                    credentials: 'include'
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData))
                return;
            }

            const data = await response.json();
            setDocuments(data);
        } catch {
            onError('Something went wrong while loading the uploaded PDFs.')
        } finally {
            setIsLoadingDocuments(false);
        }
    }

    const handleOpenDeleteDialog = async () => {
        if(!selectedCourse) {
            onError('Please select a course first.');
            return;
        }

        setOpenDeleteDialog(true);
        await fetchUploadedDocuments();
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setDocuments([]);
        setDeletingDocId(null);
    }

      const handleDeleteDocument = async (docId: string) => {
        if(!selectedCourse) {
            onError('Please select a course first.');
            return;
        }

        try {
            setDeletingDocId(docId);

            const response = await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/documents/${docId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            onSuccess('PDF deleted successfully.');

            await fetchUploadedDocuments();
        } catch {
            onError('Something went wrong while deleting the PDF.');
        } finally {
            setDeletingDocId(null);
        }
    }

    const handleHintOnlyChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if(!selectedCourse) {
            onError('Please select a course first.');
            return;
        }

        const newHintOnlyValue = event.target.checked;

        try {
            setIsUpdatedHints(true);

            const response = await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/hints-only`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        hints_only: newHintOnlyValue
                    })
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            onHintsOnlyChanged(selectedCourse.id, newHintOnlyValue);

            onSuccess(newHintOnlyValue ? 'Hints-only mode enabled.' : 'Hints-only mode disabled.');

        } catch {
            onError('Something went wrong while updating hints-only mode.')
        } finally {
            setIsUpdatedHints(false);
        }
    }

    return (
        <aside className="menu-container professor">
            <h2>Virtual Assistant Training</h2>

            <nav>
            {selectedCourse && (
                <div className="professor-menu-items">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept='application/pdf,.pdf'
                        hidden
                        onChange={handlePdfSelected}
                    />
                    <Button
                        type="button"
                        variant="contained"
                        onClick={handleUploadClick}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <CircularProgress size={18}/>
                                &nbsp;Uploading...
                            </>
                        ): (
                            'Upload PDF'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="contained"
                        onClick={handleOpenDeleteDialog}
                    >
                            Delete PDF
                    </Button>
                    <div className="professor-hints-item">
                        <span>Hints-only</span>
                        <Checkbox 
                            checked={selectedCourse.hints_only ?? false}
                            onChange={handleHintOnlyChange}
                            disabled={isUpdatingHints}
                        />
                    </div>
                </div>
            )}
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

            <BaseDialog
                open={openDeleteDialog}
                title={
                    <>
                        Uploaded PDFs
                        {selectedCourse && (
                            <>
                                {' for '}
                                <em>{selectedCourse.name}</em>
                            </>
                        )}
                    </>
                }
                onClose={handleCloseDeleteDialog}
            >
                {isLoadingDocuments? (
                    <p>Loading PDFs...</p>
                ) : documents.length === 0 ? (
                    <p>No PDFs uploaded for this course.</p>
                ) : (
                    <List>
                        {documents.map((document) => (
                            <ListItem
                                key={document.doc_id}
                                secondaryAction={
                                    <Button
                                        type="button"
                                        color="error"
                                        variant="outlined"
                                        onClick={() => handleDeleteDocument(document.doc_id)}
                                        disabled={deletingDocId === document.doc_id}
                                    >
                                        {deletingDocId === document.doc_id
                                        ? 'Deleting...' : 'Delete'}
                                    </Button>
                                }
                            >
                                <ListItemText
                                primary={document.filename}
                                secondary={`${document.chunks_indexed} chunks`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </BaseDialog>
        </aside>
    )
}