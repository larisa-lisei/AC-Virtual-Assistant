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
                                    degree: "Bachelor's degree",
                                    program: "CSIT",
                                    specific: "First Year"
                                },
                            },
                            {
                                id: 'csit-second',
                                label: "Second Year",
                                value: {
                                    degree: "Bachelor's degree",
                                    program: "CSIT",
                                    specific: "Second Year"
                                },
                            },
                            {
                                id: 'csit-third',
                                label: "Third Year",
                                value: {
                                    degree: "Bachelor's degree",
                                    program: "CSIT",
                                    specific: "Third Year"
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
                                            degree: "Bachelor's degree",
                                            program: "CSIT - Fourth year",
                                            specific: "Computer Science"
                                        },
                                    },
                                    {
                                        id: 'it',
                                        label: "Information Technology",
                                        value: {
                                            degree: "Bachelor's degree",
                                            program: "CSIT - Forth Year",
                                            specific: "Information Technology"
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
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    specific: "First Year"
                                },
                            },
                            {
                                id: 'se-second',
                                label: "Second Year",
                                value: {
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    specific: "Second Year"
                                },
                            },
                            {
                                id: 'se-third',
                                label: "Third Year",
                                value: {
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    specific: "Third Year"
                                },
                            },
                            {
                                id: 'se-fourth',
                                label: "Fourth Year",
                                value: {
                                    degree: "Bachelor's degree",
                                    program: "SE",
                                    specific: "Fourth Year"
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
                                            degree: "Master's degree",
                                            program: "CSIT - Artificial Intelligence",
                                            specific: "First Year"
                                        }
                                    },
                                    {
                                        id:'ai-second',
                                        label: "Second Year",
                                        value: {
                                            degree: "Master's degree",
                                            program: "CSIT - Artificial Intelligence",
                                            specific: "Second Year"
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
                                            degree: "Master's degree",
                                            program: "CSIT - Embedded Computers",
                                            specific: "First Year"
                                        }
                                    },
                                    {
                                        id:'ec-second',
                                        label: "Second Year",
                                        value: {
                                            degree: "Master's degree",
                                            program: "CSIT - Embedded Computers",
                                            specific: "Second Year"
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
                                            degree: "Master's degree",
                                            program: "CSIT - Distributed Systems and Web Technologies",
                                            specific: "First Year"
                                        }
                                    },
                                    {
                                        id:'dswt-second',
                                        label: "Second Year",
                                        value: {
                                            degree: "Master's degree",
                                            program: "CSIT - Distributed Systems and Web Technologies",
                                            specific: "Second Year"
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
                                            degree: "Master's degree",
                                            program: "CSIT - Cyberspace Security",
                                            specific: "First Year"
                                        }
                                    },
                                    {
                                        id:'cs-second',
                                        label: "Second Year",
                                        value: {
                                            degree: "Master's degree",
                                            program: "CSIT - Cyberspace Security",
                                            specific: "Second Year"
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
                                            degree: "Master's degree",
                                            program: "SE - Machine Learning, Robotics and Control",
                                            specific: "First Year"
                                        }
                                    },
                                    {
                                        id:'mlrc-second',
                                        label: "Second Year",
                                        value: {
                                            degree: "Master's degree",
                                            program: "SE - Machine Learning, Robotics and Control",
                                            specific: "Second Year"
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
                                            degree: "Master's degree",
                                            program: "SE - Embedded Control Systems",
                                            specific: "First Year"
                                        }
                                    },
                                    {
                                        id:'ecs-second',
                                        label: "Second Year",
                                        value: {
                                            degree: "Master's degree",
                                            program: "SE - Embedded Control Systems",
                                            specific: "Second Year"
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
            degree: "Professors",
            program: "Professors",
            specific: "Professors"
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
        activeButton.specific === value.specific
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