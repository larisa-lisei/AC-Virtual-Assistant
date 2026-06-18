import { useState } from 'react';
import './MenuComponent.css'
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import type { AdminMenuOption } from '../../ChatPage';

interface AdminMenuProps {
    activeButton: AdminMenuOption | null;
    adminMenuData: any;
    onSelectedAdminItem: (activeItem: AdminMenuOption) => void;
    onError: (message: string) => void;
}

type MenuNode = {
    id: string;
    label: React.ReactNode;
    value?: AdminMenuOption;
    children?: MenuNode[];
};

const yearLabels: Record<number, string> = {
    1: "First Year",
    2: "Second Year",
    3: "Third Year",
    4: "Fourth Year"
};

function buildBachelorProgramNode(
    programKey: string,
    programLabel: string,
    programValue: string,
    data: any //data received from backend
): MenuNode {
    return {
        id: `${programKey}-bachelor`,
        label: programLabel,
        children: data.years.bachelor.map((year: number) => {
            if(year === 4 && programKey === "csit") {
                return {
                    id: `${programKey}-bachelor-year-${year}`,
                    label: yearLabels[year],
                    children: data.specializations.bachelor.map((specialization: string) => ( {
                        id: `${programKey}-${specialization}`,
                        label: specialization,
                        // data sent to backend
                        value: {
                            role: "student",
                            degree: data.degrees.bachelor,
                            program: programValue,
                            year,
                            specialization,

                            title: "Bachelor's degree",
                            subtitle: `${programLabel} - ${yearLabels[year]} - ${specialization} `
                        }
                    }))
                }
            }

            return {
                id: `${programKey}-bachelor-year-${year}`,
                label: yearLabels[year],
                value: {
                    role: "student",
                    degree: data.degrees.bachelor,
                    program: programValue,
                    year: year,

                    title: "Bachelor's degree",
                    subtitle: `${programLabel} - ${yearLabels[year]}`
                }
            }
        })
    }
}

function buildMasterProgramNode(
    programKey: string,
    programLabel: string,
    programValue: string,
    data: any //data received from backend
): MenuNode {
    const specializations = data.specializations.master[programKey];

    return {
        id: `${programKey}-master`,
        label: programLabel,
        children: specializations.map((specialization: string) => ({
            id: `${programKey}-master-${specialization}`,
            label: specialization,
            children: data.years.master.map((year: number) => ({
                id: `${programKey}-${specialization}-${year}`,
                label: yearLabels[year],
                value: {
                    role: "student",
                    degree: data.degrees.master,
                    program: programValue,
                    specialization: specialization,
                    year: year,

                    title: "Master's degree",
                    subtitle: `${programLabel} - ${specialization} - ${yearLabels[year]}`
                }
            }))
        }))
    }
}

function buildProfessorProgramNode(
    programKey: string,
    programLabel: string,
    programValue: string
): MenuNode {
    return {
        id: `professors-${programKey}`,
        label: programLabel,
        value: {
            role: "professor",
            program: programValue,

            title: "Professors",
            subtitle: programLabel
        }
    }
}

function buildMenuData(data: any): MenuNode[] {
    const csit = data.programs.csit;
    const se = data.programs.se;

    return [
        {
            id: "students",
            label: "Students",
            children: [
                {
                    id: "bachelor",
                    label: "Bachelor's degree",
                    children: [
                        buildBachelorProgramNode("csit", "CSIT", csit, data),
                        buildBachelorProgramNode("se", "SE", se, data)
                    ]
                },
                {
                    id: "master",
                    label: "Master's degree",
                    children: [
                        buildMasterProgramNode("csit", "CSIT", csit, data),
                        buildMasterProgramNode("se", "SE", se, data)
                    ]
                }
            ]
        },
        {
            id: "professors",
            label: "Professors",
            children: [
                buildProfessorProgramNode("csit", "CSIT", csit),
                buildProfessorProgramNode("se", "SE", se)
            ]
        }
    ]
}

function isSelected(
    activeButton: AdminMenuOption | null,
    value?: AdminMenuOption
) {
    if(!activeButton || !value) return false;

    return (
        activeButton.degree === value.degree &&
        activeButton.program === value.program &&
        activeButton.year === value.year &&
        activeButton.specialization === value.specialization
    );
}

function formatMenuLabel(label: React.ReactNode) {
    if (typeof label !== "string") {
        return label;
    }

    if (label === "Distributed Systems and Web Technologies") {
        return (
            <>
                Distributed Systems and
                <br />
                Web Technologies
            </>
        );
    }

    if (label === "Machine Learning, Robotics and Control") {
        return (
            <>
                Machine Learning, Robotics
                <br />
                and Control
            </>
        );
    }

    return label;
}

export default function AdminMenu({
    activeButton,
    adminMenuData,
    onSelectedAdminItem
} : AdminMenuProps) {
    const [open, setOpen] = useState<Record<string, boolean>>({});
    const menuData = adminMenuData ? buildMenuData(adminMenuData) : [];

    const handleClick = (id: string) => {
        setOpen(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderNode = (node: MenuNode, level = 0) => {
        const hasChildren = node.children !== undefined && node.children?.length > 0;
        const expanded = open[node.id] === true;
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
                    <ListItemText primary={formatMenuLabel(node.label)} />
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
