import { useState } from 'react';
import './MenuComponent.css'
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import type { AdminMenuOption } from '../../ChatPage';

interface AdminMenuProps {
    activeButton: AdminMenuOption | null;
    onSelectedAdminItem: (activeItem: AdminMenuOption) => void;
}

export default function AdminMenu({
    activeButton,
    onSelectedAdminItem
} : AdminMenuProps) {
    const [open, setOpen] = useState({
        students: false,
        bachelor: false,
        'cti-bachelor': false,
        'is-bachelor': false,
        master: false,
        'cti-master': false,
        'is-master': false,
        //professors: false,
    });

    const handleClick = (section: keyof typeof open) => {
        const newState = { ...open };
        newState[section] = !newState[section];
        setOpen(newState);
    };

    return (
        <aside className="menu-container">
            <h2>Accounts</h2>

            <nav className="admin-menu-items">
                <div className="students-expand-button">
                    <ListItemButton
                        selected={open.students}
                        onClick={() => handleClick('students')}
                    >
                        <ListItemText primary="Students"></ListItemText>
                        {open.students ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </div>

                <Collapse in={open.students} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding >
                        <ListItemButton 
                            sx={{ pl: 4 }}
                            selected={open.bachelor}
                            onClick={() => handleClick('bachelor')}
                        >
                            <ListItemText primary="Bachelor's degree"></ListItemText>
                            {open.bachelor ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>

                        <Collapse in={open.bachelor} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton
                                    sx={{ pl: 8 }}
                                    selected={open['cti-bachelor']}
                                    onClick={() => handleClick('cti-bachelor')}
                                >
                                    <ListItemText primary="CTI"></ListItemText>
                                    {open['cti-bachelor'] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>

                                <Collapse in={open['cti-bachelor']} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "First Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "CTI",
                                                specific: "First Year"
                                            })
                                            }
                                        >
                                            <ListItemText primary="First Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "Second Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "CTI",
                                                specific: "Second Year"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Second Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "Third Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "CTI",
                                                specific: "Third Year"
                                            })
                                            }
                                        >   
                                            <ListItemText primary="Third Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "Fourth Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "CTI",
                                                specific: "Fourth Year"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Fourth Year"></ListItemText>
                                        </ListItemButton>
                                    </List>
                                </Collapse>

                                <ListItemButton
                                    sx={{ pl: 8 }}
                                    selected={open['is-bachelor']}
                                    onClick={() => handleClick('is-bachelor')}
                                >
                                    <ListItemText primary="IS"></ListItemText>
                                    {open['is-bachelor'] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>

                                <Collapse in={open['is-bachelor']} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "IS" &&
                                                activeButton?.specific === "First Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "IS",
                                                specific: "First Year"
                                            })
                                            }
                                        >
                                            <ListItemText primary="First Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "IS" &&
                                                activeButton?.specific === "Second Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "IS",
                                                specific: "Second Year"
                                            })
                                            }
                                         >
                                            <ListItemText primary="Second Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "IS" &&
                                                activeButton?.specific === "Third Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "IS",
                                                specific: "Third Year"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Third Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Bachelor's degree" &&
                                                activeButton?.program === "IS" &&
                                                activeButton?.specific === "Fourth Year"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Bachelor's degree",
                                                program: "IS",
                                                specific: "Fourth Year"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Fourth Year"></ListItemText>
                                        </ListItemButton>
                                    </List>
                                </Collapse>

                            </List>
                        </Collapse>

                        <ListItemButton 
                            sx={{ pl: 4 }}
                            selected={open.master}
                            onClick={() => handleClick('master')}
                        >
                            <ListItemText primary="Master's degree"></ListItemText>
                            {open.master ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>

                        <Collapse in={open.master} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton
                                    sx={{ pl: 8 }}
                                    selected={open['cti-master']}
                                    onClick={() => handleClick('cti-master')}
                                >
                                    <ListItemText primary="CTI"></ListItemText>
                                    {open['cti-master'] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>

                                <Collapse in={open['cti-master']} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItemButton
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Master's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "Artificial Intelligence"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Master's degree",
                                                program: "CTI",
                                                specific: "Artificial Intelligence"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Artificial Intelligence"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Master's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "Embedded Computers"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Master's degree",
                                                program: "CTI",
                                                specific: "Embedded Computers"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Embedded Computers"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Master's degree" &&
                                                activeButton?.program === "CTI" &&
                                                activeButton?.specific === "Distributed Systems and Web Technologies"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Master's degree",
                                                program: "CTI",
                                                specific: "Distributed Systems and Web Technologies"
                                            })
                                            }
                                        >
                                            <ListItemText primary="Distributed Systems and Web Technologies"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                    activeButton?.degree === "Master's degree" &&
                                                    activeButton?.program === "CTI" &&
                                                    activeButton?.specific === "Cyberspace security"
                                                }
                                                onClick={() => onSelectedAdminItem({
                                                    degree: "Master's degree",
                                                    program: "CTI",
                                                    specific: "Cyberspace security"
                                                })
                                            }
                                        >
                                            <ListItemText primary="Cyberspace security"></ListItemText>
                                        </ListItemButton>
                                    </List>
                                </Collapse>

                                <ListItemButton
                                    sx={{ pl: 8 }}
                                    selected={open['is-master']}
                                    onClick={() => handleClick('is-master')}
                                >
                                    <ListItemText primary="IS"></ListItemText>
                                    {open['is-master'] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>

                                <Collapse in={open['is-master']} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                        <ListItemButton
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Master's degree" &&
                                                activeButton?.program === "IS" &&
                                                activeButton?.specific === "Machine Learning, Robotics and Control"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Master's degree",
                                                program: "IS",
                                                specific: "Machine Learning, Robotics and Control"
                                            })
                                        }
                                         >
                                            <ListItemText primary="Machine Learning, Robotics and Control"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={
                                                activeButton?.degree === "Master's degree" &&
                                                activeButton?.program === "IS" &&
                                                activeButton?.specific === "Embedded Control Systems"
                                            }
                                            onClick={() => onSelectedAdminItem({
                                                degree: "Master's degree",
                                                program: "IS",
                                                specific: "Embedded Control Systems"
                                            })
                                        }
                                        >
                                            <ListItemText primary="Embedded Control Systems"></ListItemText>
                                        </ListItemButton>
                                    </List>
                                </Collapse>

                            </List>
                        </Collapse>

                    </List>
                </Collapse>

                <div className="students-expand-button">
                    <ListItemButton
                        className='leaf-button'
                        //Temporary solution
                        selected={
                            activeButton?.degree === "Professors" &&
                            activeButton?.program === "Professors" &&
                            activeButton?.specific === "Professors"
                            }
                            onClick={() => onSelectedAdminItem({
                                degree: "Professors",
                                program: "Professors",
                                specific: "Professors"
                            })
                        }
                    >
                        <ListItemText primary="Professors"></ListItemText>
                    </ListItemButton>
                </div>
            </nav>
        </aside>
    )
}