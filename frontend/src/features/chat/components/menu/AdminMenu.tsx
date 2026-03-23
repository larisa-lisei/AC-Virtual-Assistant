import { useState } from 'react';
import './MenuComponent.css'
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import type { AdminMenuOption } from '../../ChatPage';

interface AdminMenuProps {
    activeButton: AdminMenuOption | null;
    onSelectedAdminItem: (activeItem: AdminMenuOption) => void;
}

type MenuNode = {
    id: string;
    label: React.ReactNode;
    value?: AdminMenuOption;
    children?: MenuNode[];
};

const menuData: MenuNode[] = [
    {
        id: 'students',
        label: 'Students',
        children: [
            {
                id: 'bachelor',
                label: "Bachelor's degree",
                children: [
                    {
                        id: "csit-bachelor",
                        label: "CSIT",
                        children: [
                            {
                                id: 'csit-first',
                                label: "First Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "CSIT",
                                    year: 1
                                },
                            },
                            {
                                id: 'csit-second',
                                label: "Second Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "CSIT",
                                    year: 2
                                },
                            },
                            {
                                id: 'csit-third',
                                label: "Third Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "CSIT",
                                    year: 3
                                },
                            },
                            {
                                id: 'csit-fourth',
                                label: "Fourth Year",
                                children: [
                                    {
                                        id: 'cs',
                                        label: "Computer Science",
                                        value: {
                                            role: 'student',
                                            degree: "Bachelor's degree",
                                            program: "CSIT",
                                            year: 4,
                                            specialization: "Computer Science"
                                        },
                                    },
                                    {
                                        id: 'it',
                                        label: "Information Technology",
                                        value: {
                                            role: 'student',
                                            degree: "Bachelor's degree",
                                            program: "CSIT",
                                            year: 4,
                                            specialization: "Information Technology"
                                        }
                                    },
                                ]
                            }
                        ]
                    },
                    {
                        id: "se-bachelor",
                        label: "SE",
                        children: [
                            {
                                id: 'se-first',
                                label: "First Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    year: 1
                                },
                            },
                            {
                                id: 'se-second',
                                label: "Second Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    year: 2
                                },
                            },
                            {
                                id: 'se-third',
                                label: "Third Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    year: 3
                                },
                            },
                            {
                                id: 'se-fourth',
                                label: "Fourth Year",
                                value: {
                                    role: 'student',
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    year: 4
                                }
                            }
                        ]
                    },
                ]
            },
            {
                id: 'master',
                label: "Master's degree",
                children: [
                    {
                        id: 'csit-master',
                        label: "CSIT",
                        children: [
                            {
                                id: 'csit-ai',
                                label: "Artificial Intelligence",
                                children: [
                                    {
                                        id:'ai-first',
                                        label: "First Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Artificial Intelligence",
                                            year: 1
                                        }
                                    },
                                    {
                                        id:'ai-second',
                                        label: "Second Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Artificial Intelligence",
                                            year: 2
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'csit-ec',
                                label: "Embedded Computers",
                                children: [
                                    {
                                        id:'ec-first',
                                        label: "First Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Embedded Computers",
                                            year: 1
                                        }
                                    },
                                    {
                                        id:'ec-second',
                                        label: "Second Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Embedded Computers",
                                            year: 2
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'csit-dswt',
                                label: 
                                <>
                                    Distributed Systems and <br /> Web Technologies
                                </>,
                                children: [
                                    {
                                        id:'dswt-first',
                                        label: "First Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Distributed Systems and Web Technologies",
                                            year: 1
                                        }
                                    },
                                    {
                                        id:'dswt-second',
                                        label: "Second Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Distributed Systems and Web Technologies",
                                            year: 2
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'csit-cs',
                                label: "Cyberspace Security",
                                children: [
                                    {
                                        id:'cs-first',
                                        label: "First Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Cyberspace Security",
                                            year: 1
                                        }
                                    },
                                    {
                                        id:'cs-second',
                                        label: "Second Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "CSIT",
                                            specialization: "Cyberspace Security",
                                            year: 2
                                        }
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        id: "se-master",
                        label: "SE",
                        children: [
                            {
                                id: 'se-mlrc',
                                label: 
                                <>
                                    Machine Learning, Robotics <br /> and Control
                                </>,
                                children: [
                                     {
                                        id:'mlrc-first',
                                        label: "First Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "SE",
                                            specialization: "Machine Learning, Robotics and Control",
                                            year: 1
                                        }
                                    },
                                    {
                                        id:'mlrc-second',
                                        label: "Second Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "SE",
                                            specialization: "Machine Learning, Robotics and Control",
                                            year: 2
                                        }
                                    },
                                ]
                            },
                            {
                                id: 'se-ecs',
                                label: "Embedded Control Systems",
                                children: [
                                     {
                                        id:'ecs-first',
                                        label: "First Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "SE",
                                            specialization: "Embedded Control Systems",
                                            year: 1
                                        }
                                    },
                                    {
                                        id:'ecs-second',
                                        label: "Second Year",
                                        value: {
                                            role: 'student',
                                            degree: "Master's degree",
                                            program: "SE",
                                            specialization: "Embedded Control Systems",
                                            year: 2
                                        }
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
        ]
    },
    {
        id: 'professors',
        label: "Professors",
        value: {
            role: "professor"
        }
    }
];

function isSelected(
    activeButton: AdminMenuOption | null,
    value?: AdminMenuOption
) {
    if(!activeButton || !value) return false;

    return (
        activeButton.degree === value.degree &&
        activeButton.program === value.program &&
        activeButton.year === value.year &&
        activeButton.specialization == value.specialization
    );
}

export default function AdminMenu({
    activeButton,
    onSelectedAdminItem
} : AdminMenuProps) {
    const [open, setOpen] = useState<Record<string, boolean>>({});

    const handleClick = (id: string) => {
        setOpen(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderNode = (node: MenuNode, level = 0) => {
        const hasChildren = node.children !== undefined && node.children?.length > 0;
        const expanded = open[node.id] == true;
        const selected = isSelected(activeButton, node.value);

        return (
            <div key={node.id}>
                <ListItemButton
                    className={`${!hasChildren ? 'leaf-button' : ''} ${expanded ? 'expanded' : ''}`}
                    sx={{ 
                        pl: 2 + level * 2,
                        backgroundColor: expanded ? 'rgba(0, 0, 0, 0.08)' : 'inherit'
                    }}
                    selected={selected}
                    onClick={() => {
                        if (hasChildren) {
                            handleClick(node.id)
                        } else if (node.value) {
                            onSelectedAdminItem(node.value)
                        }
                    }}
                >
                    <ListItemText primary={node.label} />
                    {hasChildren ? (expanded ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>

                {hasChildren && (
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <List disablePadding>
                            {node.children?.map(child => renderNode(child, level + 1))}
                        </List>
                    </Collapse>
                )}
            </div>
        );
    };

    return (
        <aside className="menu-container">
            <h2>Accounts</h2>
            <nav className='admin-menu-items'>
                <List disablePadding>
                    {menuData.map(node => renderNode(node))}
                </List>
            </nav>
        </aside>
    )
}