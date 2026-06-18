import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button} from '@mui/material';
import type { AdminMenuOption, Course } from '../ChatPage';
import './ChatComponent.css'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import BaseDialog from './BaseDialog';
import { getErrorMessage } from '../../../utils/error';
import AccountForm, { emptyFormData, type AccountFormData} from "./AccountForm";

type DialogType = 'addAccount' | 'deleteAccount' | 'editAccount' | null;

interface AdminChatComponentProps {
    activeItem:  AdminMenuOption | null;
    adminMenuData: any;
    onError: (message: string) => void;
    onSuccess: (message: string) => void;
}

type AccountRow = {
    id: string;
    email: string;
    group?: string;
    course_ids?: string[];
    course_names?: string[];
    is_active: boolean;
};

export default function AdminChatComponent({
    activeItem, 
    adminMenuData,
    onError,
    onSuccess
} : AdminChatComponentProps ) {
    const [openDialog, setOpenDialog] = useState<DialogType>(null);
    const [rows, setRows] = useState<AccountRow[]>([]);
    //one row with no, groupNumber and email info
    const [currentRow, setCurrentRow] = useState<AccountRow | null>(null);

    const [searchText, setSearchText] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const fetchAccounts = async () => {
        if(!activeItem){
            setRows([]);
            return;
        }

        try {
            const params = new URLSearchParams();

            if(activeItem.degree) {
                params.append("degree", activeItem.degree);
            }

            if(activeItem.program) {
                params.append("program", activeItem.program);
            }

            if(activeItem.year) {
                params.append("year", String(activeItem.year));
            }

            if(activeItem.specialization) {
                params.append("specialization", activeItem.specialization);
            }

            if(searchText.trim()) {
                params.append("search", searchText.trim());
            }

            let apiAccounts = ""

            if (activeItem.role === "student") {
                apiAccounts = `${API_BASE_URL}/users/students?${params.toString()}`
            }
            else if (activeItem.role === "professor") {
                apiAccounts = `${API_BASE_URL}/users/professors?${params.toString()}`
            }
            else {
                return;
            }

            const response = await fetch(apiAccounts,
            {
                method: "GET",
                credentials: "include"
            });

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            const data = await response.json();
            console.log(data)
            setRows(data);
        } catch(error) {
            onError("Something went wrong.")
        }
    }

    const [courses, setCourses] = useState<Course[]>([]);
    const fetchCourses = async() => {
        if(!activeItem || activeItem.role !== "professor") {
            setCourses([]);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/courses?program=${activeItem.program}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            const data = await response.json();
            setCourses(data);
        } catch {
            onError("Something went wrong.");
        }
    }

    useEffect(() => {
        fetchAccounts();
        fetchCourses();
    }, [activeItem, searchText]);

    const [formData, setFormData] = useState<AccountFormData>(emptyFormData);
    const closeDialog = () => {
        setOpenDialog(null);
        setCurrentRow(null);
        setFormData(emptyFormData);
    };

    const openAddDialog = () => {
        setCurrentRow(null);
        setFormData(emptyFormData);
        setOpenDialog('addAccount');
    };

    const openEditDialog = (row: AccountRow) => {
        setCurrentRow(row);

        const selectedCoursesProfessor = courses.filter((course) => {
            if(row.course_ids?.length) {
                return row.course_ids.includes(course.id);
            }
            return false;
        });

        setFormData({
            mode: 'edit',
            email: row.email,
            group: row.group ?? '',
            selectedCourses: selectedCoursesProfessor,
            isAddingNewCourse: false,
            courseName: '',
            courseDegree: '',
            courseYear: '',
            courseSpecialization: ''
        });
        setOpenDialog('editAccount');
    };

    // add student account
    const handleAddStudent = async () => {
        if(!activeItem || activeItem.role !== "student") {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/add-account/student`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email,
                    degree: activeItem.degree,
                    program: activeItem.program,
                    year: activeItem.year,
                    specialization: activeItem.specialization ?? null,
                    group: formData.group
                })
            });

            if(!response.ok) {
                const erroData = await response.json();
                onError(getErrorMessage(erroData))
                return;
            }

            onSuccess("Student account added successfully.");
            closeDialog();
            //refresh table
            await fetchAccounts();
        } catch {
            onError("Something went wrong.");
        }
    }

    const handleAddProfessor = async () => {
        if (!activeItem || activeItem.role !== "professor") {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/add-account/professor`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: formData.email,
                    program: activeItem.program,

                    existing_course_ids: formData.isAddingNewCourse ? [] : formData.selectedCourses.map((course) => course.id),

                    new_course: formData.isAddingNewCourse ? {
                        name: formData.courseName,
                        degree: formData.courseDegree,
                        program: activeItem.program,
                        year: Number(formData.courseYear),
                        specialization: formData.courseSpecialization || null
                    } : null
                })
            });

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            onSuccess("Professor account added successfully.");
            closeDialog();
            await fetchAccounts();
            await fetchCourses();
        } catch {
            onError("Something went wrong.");
        }
    }

    // edit account
    const handleEditStudent = async () => {
        if(!activeItem || activeItem.role !== "student" || !currentRow) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/students/${currentRow.id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        group: formData.group
                    })
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }
            onSuccess("Student account updated successfully.");
            closeDialog();
            await fetchAccounts();
        } catch {
            onError("Something went wrong.");
        }
    }

    const handleEditProfessor = async () => {
        if(!activeItem || activeItem.role !== "professor" || !currentRow) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/professors/${currentRow.id}`,
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        existing_course_ids: formData.selectedCourses.map((course) => course.id),
                        new_course: formData.isAddingNewCourse ? {
                            name: formData.courseName,
                            degree: formData.courseDegree,
                            program: activeItem.program,
                            year: Number(formData.courseYear),
                            specialization: formData.courseSpecialization || null
                        }
                        : null
                    })
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            closeDialog();
            await fetchAccounts();
            await fetchCourses();
            onSuccess("Professor account updated successfully.");
        } catch {
            onError("Something went wrong.");
        }
    };

    const handleSumbitAccountForm = async () => {
        if (!activeItem) {
            return;
        }

        if (openDialog === 'addAccount') {
            if(activeItem.role === 'student') {
                await handleAddStudent();
            } else {
                await handleAddProfessor();
            }
        }

        if (openDialog === 'editAccount') {
            if (activeItem.role === 'student') {
                await handleEditStudent();
            } else {
                await handleEditProfessor();
            }
        }
    }

    const handleDeleteAccount = async () => {
        if(!currentRow) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/users/${currentRow.id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            closeDialog();
            await fetchAccounts();
            onSuccess("Account deleted successfully.");
        } catch {
            onError("Something went wrong.");
        }
    };

     // delete courses from drop-down select menu
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const openDeleteCourse = (course: Course) => {
        setCourseToDelete(course);
    };
    const closeDeleteCourse = () => {
        setCourseToDelete(null);
    };

    const handleDeleteCourse = async () => {
        if(!courseToDelete) {
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/courses/${courseToDelete.id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            if(!response.ok) {
                const errorData = await response.json();
                onError(getErrorMessage(errorData));
                return;
            }

            setFormData((prevData) => ({
                ...prevData,
                selectedCourses: prevData.selectedCourses.filter(
                    (course) => course.id !== courseToDelete.id
                )
            }));

            closeDeleteCourse();
            await fetchCourses();
            await fetchAccounts();

            onSuccess("Course deleted successfully.");
        } catch {
            onError("Something went wrong.")
        }
    }

    //welcome message
    if(!activeItem) {
        return (
            <div className="chat-component-container">
                <div className="chat-description">
                    <h2>Welcome to AC Virtual Assistant!</h2>
                    <p>Manage AC accounts.</p> 
                </div>
            </div>
        )
    }

    return (
        <div className="chat-component-container">
            <div className="admin-title">
                <h2>{activeItem.title}</h2>
                
                {activeItem.subtitle && (<h3>{activeItem.subtitle}</h3>)}
            </div>
            <div className="input-text">
                <div className="input-wrapper admin">
                    <input 
                        type="text" 
                        placeholder={activeItem.role === "student" ? (
                            "Search by email address or group...") : (
                            "Search by email address or course...")
                        }
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <SearchIcon className="input-icon" style={{ cursor: "default" }}/>
                </div>
            </div>
            <div className="admin-table-wrapper">
                <TableContainer className="admin-table">
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">No</TableCell>
                                <TableCell align="center">Email Address</TableCell>
                                {activeItem.role === "student" ? (
                                    <TableCell align="center">Group Number</TableCell>
                                ) : (
                                    <TableCell align="center">Courses</TableCell>
                                )}
                                <TableCell align="center">Active</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        align="center"
                                    >
                                        There are no {activeItem.role} accounts available yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                            rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                                >
                                    <TableCell align="center">{index+1}</TableCell>
                                    <TableCell align="center">{row.email}</TableCell>
                                    {activeItem.role === "student" ? (
                                        <TableCell align="center">
                                            {"group" in row ? row.group : ""}
                                        </TableCell>
                                    ): (
                                        <TableCell align="center">
                                            {"course_names" in row && row.course_names?.length ? row.course_names.join(", ") : "No course assigned"}
                                        </TableCell>
                                    )}
                                    <TableCell align="center">
                                        {row.is_active ? (
                                            <CheckIcon color="success" />
                                        ) : (
                                            <CloseIcon color="error" />
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <div className="admin-row-buttons">
                                            <button
                                                type="button"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    setCurrentRow(row);
                                                    setOpenDialog('deleteAccount');
                                                }}>
                                                    <DeleteOutlineIcon fontSize='small'/>
                                            </button>
                                            <button
                                                type="button"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => openEditDialog(row)}
                                            >
                                                <EditOutlinedIcon fontSize='small'/>
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            <div className="admin-add-account">
                <Button 
                    type="button"
                    variant="contained"
                    onClick={openAddDialog}>
                        Add Account
                </Button>
            </div>

            {/* Add account dialog */}
            <BaseDialog
                open={openDialog === 'addAccount'}
                title="Add New Account"
                onClose={closeDialog}
                onConfirm={handleSumbitAccountForm}
                confirmText='Add Account'
            >
                <AccountForm
                    mode='add'
                    data={formData}
                    setData={setFormData}
                    courses={courses}
                    adminMenuData={adminMenuData}
                    activeItem={activeItem} 
                    deleteCourse={openDeleteCourse}   
                />
            </BaseDialog>

            {/* Delete account dialog */}
            <BaseDialog
                open={openDialog === 'deleteAccount'}
                title={
                    <>
                        Are you sure you want to delete{" "}
                        <span className="admin-account-email">
                            {currentRow?.email ?? ""}
                        </span>{" "} account?
                    </>
                }
                onClose={closeDialog}
                onConfirm={handleDeleteAccount}
                confirmText='Delete account'
            >
            </BaseDialog>

            {/* Edit account dialog */}
            <BaseDialog
                open={openDialog === 'editAccount' }
                title='Edit account'
                onClose={closeDialog}
                onConfirm={handleSumbitAccountForm}
                confirmText='Save'
            >
                <AccountForm
                    mode='edit'
                    data={formData}
                    setData={setFormData}
                    courses={courses}
                    adminMenuData={adminMenuData}
                    activeItem={activeItem} 
                    deleteCourse={openDeleteCourse}
                />
            </BaseDialog>

            {/* Delete Course Dialog */}
            <BaseDialog
                open={courseToDelete !== null}
                title={
                    <>
                        Are you sure you want to delete{" "}
                        <span className='admin-account-email'>
                            {courseToDelete?.name?? ""}
                        </span>{" "} course?
                    </>
                }
                onClose={closeDeleteCourse}
                onConfirm={handleDeleteCourse}
                confirmText='Delete course'
            >
                <h3>
                    This course will be deleted permanently and removed from every professor
                    account linked to it!
                </h3>
            </BaseDialog>
        </div>
    )
}