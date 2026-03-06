import { useState } from 'react';
import './MenuComponent.css'
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

export default function AdminMenu() {
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

    const [activeButton, setActiveButton] = useState<string | null>(null);

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
                                            selected={activeButton === 'cti-bachelor-year1'}
                                            onClick={() => setActiveButton('cti-bachelor-year1')}
                                        >
                                            <ListItemText primary="First Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'cti-bachelor-year2'}
                                            onClick={() => setActiveButton('cti-bachelor-year2')}
                                        >
                                            <ListItemText primary="Second Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'cti-bachelor-year3'}
                                            onClick={() => setActiveButton('cti-bachelor-year3')}
                                        >
                                            <ListItemText primary="Third Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'cti-bachelor-year4'}
                                            onClick={() => setActiveButton('cti-bachelor-year4')}
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
                                            selected={activeButton === 'is-bachelor-year1'}
                                            onClick={() => setActiveButton('is-bachelor-year1')}
                                        >
                                            <ListItemText primary="First Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'is-bachelor-year2'}
                                            onClick={() => setActiveButton('is-bachelor-year2')}
                                         >
                                            <ListItemText primary="Second Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'is-bachelor-year3'}
                                            onClick={() => setActiveButton('is-bachelor-year3')}
                                        >
                                            <ListItemText primary="Third Year"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'is-bachelor-year4'}
                                            onClick={() => setActiveButton('is-bachelor-year4')}
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
                                            selected={activeButton === 'cti-ai'}
                                            onClick={() => setActiveButton('cti-ai')}
                                        >
                                            <ListItemText primary="Artificial Intelligence"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'cti-ec'}
                                            onClick={() => setActiveButton('cti-ec')}
                                        >
                                            <ListItemText primary="Embedded Computers"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'cti-dswt'}
                                            onClick={() => setActiveButton('cti-dswt')}
                                        >
                                            <ListItemText primary="Distributed Systems and Web Technologies"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'cti-cs'}
                                            onClick={() => setActiveButton('cti-cs')}
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
                                            selected={activeButton === 'is-mlrc'}
                                            onClick={() => setActiveButton('is-mlrc')}
                                         >
                                            <ListItemText primary="Machine Learning, Robotics and Control"></ListItemText>
                                        </ListItemButton>
                                        <ListItemButton 
                                            className='leaf-button'
                                            sx={{pl: 12}}
                                            selected={activeButton === 'is-ecs'}
                                            onClick={() => setActiveButton('is-ecs')}
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
                        selected={activeButton === 'professors'}
                        onClick={() => setActiveButton('professors')}
                    >
                        <ListItemText primary="Professors"></ListItemText>
                    </ListItemButton>
                </div>
            </nav>
        </aside>
    )
}