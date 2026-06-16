import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {Autocomplete, Button, MenuItem, Stack, TextField, Box, IconButton} from "@mui/material"
import type {AdminMenuOption} from "../ChatPage"
import "./ChatComponent.css"

export type Course = {
    id: string;
    name: string;
    degree: string;
    year: number;
    specialization?: string | null
};

export type AccountFormData = {
    mode: 'add' | 'edit';
    email: string;
    group: string;
    selectedCourses: Course[];
    isAddingNewCourse: boolean;
    courseName: string;
    courseDegree: string;
    courseYear: string;
    courseSpecialization: string;
};

type AccountFormProps = {
    mode: 'add' | 'edit';
    data: AccountFormData;
    setData: React.Dispatch<React.SetStateAction<AccountFormData>>;
    courses: Course[];
    adminMenuData: any;
    activeItem: AdminMenuOption;
    deleteCourse: (course: Course) => void;
};

export const emptyFormData: AccountFormData = {
    mode: 'add',
    email: '',
    group: '',
    selectedCourses: [],
    isAddingNewCourse: false,
    courseName: '',
    courseDegree: '',
    courseYear: '',
    courseSpecialization: ''
};

export default function AccountForm({
    mode,
    data,
    setData,
    courses,
    adminMenuData,
    activeItem,
    deleteCourse
}: AccountFormProps) {
    const degreeOptions = adminMenuData?.degrees ?? {};
    const yearOptions = data.courseDegree ? adminMenuData?.years?.[data.courseDegree] ?? [] : [];
    // find corresponding program key based on the ux long value for activeItem
    const programKey = Object.entries(adminMenuData?.programs ?? {})
                        .find(([_,  value]) =>  value === activeItem?.program)?.[0];
    const specializationOptions = data.courseDegree === "bachelor" ? adminMenuData?.specializations?.bachelor ?? [] :
                                data.courseDegree === "master" ? adminMenuData?.specializations?.master?.[programKey ?? ""] ?? [] : [];

    const showSpecialization = data.courseDegree === "master" || (data.courseDegree === "bachelor" && Number(data.courseYear) === 4);

    // only for keys in AccountFormData
    const updateField = <K extends keyof AccountFormData>(
        field: K,
        data: AccountFormData[K]
    ) => {
        setData((prevData) => ({
            ...prevData,
            [field]: data
        }));
    };

    return (
         <Stack spacing={5}>
            <TextField
                fullWidth
                label="Email"
                type="email"
                required
                value={data.email}
                disabled={mode === 'edit'}
                onChange={(e) => updateField('email', e.target.value)}
            />
            {activeItem.role === "student" ? (
            <TextField
                fullWidth
                label="Group"
                type="text"
                required
                value={data.group}
                onChange={(e) => updateField('group', e.target.value)}
            />
            ): (
                <>
                    {!data.isAddingNewCourse && (
                        <Autocomplete
                            multiple
                            options={courses}
                            value={data.selectedCourses}
                            onChange={(_, value) => updateField('selectedCourses', value)}
                            getOptionLabel={(course) => 
                                `${course.name} - ${course.degree} - Year ${course.year}${
                                    course.specialization ? ` - ${course.specialization}` : ""
                                }`
                            }
                            renderOption={(props, course) => (
                                <li {...props} key={course.id}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%"
                                        }}
                                    >
                                        <Box>
                                             <strong>{course.name} </strong>
                                            {` - ${course.degree} - Year ${course.year}`}
                                            {course.specialization && ` - ${course.specialization}`}
                                        </Box>

                                        <IconButton
                                            size="small"
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                            }}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                deleteCourse(course);
                                            }}
                                        >
                                            <DeleteOutlineIcon fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Existing Courses"
                                    placeholder="Select courses..."
                                />
                            )}
                        />
                    )}

                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => {
                            setData((prevData) => ({
                                ...prevData,
                                isAddingNewCourse: !prevData.isAddingNewCourse,
                                courseName: '',
                                courseDegree: '',
                                courseYear: '',
                                courseSpecialization: ''
                            }));
                        }}
                    >
                        {data.isAddingNewCourse ? "Select Existing Courses"  : "Add New Course"}
                    </Button>

                    {data.isAddingNewCourse && (
                        <>
                            <TextField
                                fullWidth
                                label="Course Name"
                                required
                                value={data.courseName}
                                onChange={(e) => updateField('courseName', e.target.value)}
                            />
                            <TextField
                                select
                                fullWidth
                                label="Degree"
                                required
                                value={data.courseDegree}
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        courseDegree: e.target.value,
                                        courseYear: '',
                                        courseSpecialization: ''
                                    }));
                                }}
                                slotProps={{
                                    input: {
                                        sx: {
                                            textAlign: "left"
                                    }
                                    }
                                }}
                            >
                                {Object.entries(degreeOptions).map(([degree]) => (
                                    <MenuItem key={degree} value={degree}>
                                        {degree}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                fullWidth
                                label="Year"
                                type="number"
                                required
                                value={data.courseYear}
                                onChange={(e) => {
                                    setData((prevData) => ({
                                        ...prevData,
                                        courseYear: e.target.value,
                                        courseSpecialization: ''
                                    }))
                                }}
                                disabled={!data.courseDegree}
                                slotProps={{
                                    input: {
                                        sx: {
                                            textAlign: "left"
                                    }
                                    }
                                }}
                            >
                                {yearOptions.map((year: number) => (
                                    <MenuItem key={year} value={year}>
                                        year {year}
                                    </MenuItem>
                                ))}
                            </TextField>
                            {showSpecialization && (
                                <TextField
                                    select
                                    fullWidth
                                    label="Specialization"
                                    value={data.courseSpecialization}
                                    onChange={(e) => updateField('courseSpecialization', e.target.value)}
                                    slotProps={{
                                    input: {
                                        sx: {
                                            textAlign: "left"
                                    }
                                    }
                                }}
                                >
                                    {specializationOptions.map((specialization: string) => (
                                        <MenuItem key={specialization} value={specialization}>
                                            {specialization}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </>
                    )}
                </>
            )}
        </Stack>
    )  
}

