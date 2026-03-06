import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button, TextField } from '@mui/material';
import type { AdminMenuOption } from '../ChatPage';
import './ChatComponent.css'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import AdminDialog from './AdminDialog';

type DialogType = 'addAccount' | 'deleteAccount' | 'editAccount' | null;

interface AdminChatComponentProps {
    activeItem:  AdminMenuOption | null;
}

// data example 
function createData(
    no: number,
    groupNumber: string,
    email: string,
) {
    return { no, groupNumber, email }
}

const rows = [
    createData(1, '1208A', 'ion.pop@student.tuiasi.ro'),
    createData(2, '1409A', 'andrei-mihai.popescu@student.tuiasi.ro'),
    createData(3, '1308B', 'andreea.mihailescu@student.tuiasi.ro')
];

export default function AdminChatComponent( {activeItem} : AdminChatComponentProps ) {

    const [openDialog, setOpenDialog] = useState<DialogType>(null);

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
                <h2>{activeItem.degree}</h2>
                <h3>{activeItem.program} - {activeItem.specific}</h3>
            </div>
            <div className="input-text">
                <div className="input-wrapper admin">
                    <input type="text" placeholder="Search by group or email address..."/>
                    <SearchIcon className="input-icon"/>
                </div>
            </div>
            <div className="admin-table-wrapper">
                <TableContainer className="admin-table">
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">No</TableCell>
                                <TableCell align="center">Group Number</TableCell>
                                <TableCell align="center">Email Address</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.no}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                                >
                                    <TableCell align="center">{row.no}</TableCell>
                                    <TableCell align="center">{row.groupNumber}</TableCell>
                                    <TableCell align="center">{row.email}</TableCell>
                                    <TableCell align="right">
                                        <div className="admin-row-buttons">
                                            <button><DeleteOutlineIcon fontSize='small'/></button>
                                            <button><EditOutlinedIcon fontSize='small'/></button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <div className="admin-add-account">
                <Button 
                    type="button"
                    variant="contained"
                    onClick={() => setOpenDialog('addAccount')}>
                        Add Account
                </Button>

                <AdminDialog
                    open={openDialog === "addAccount"}
                    title="Add New Account"
                    onClose={() => setOpenDialog(null)}
                    onConfirm={() => setOpenDialog(null)}
                    confirmText='Add Account'
                >
                    <>
                        <TextField
                            label="Email"
                            type="email"
                            required
                            //value={email}
                            //onChange={(e) => setEmail(e.target.value)}
                        />
                        <br/>
                        <br/>
                        <TextField
                            label="Group"
                            type="text"
                            required
                            //value={group}
                            //onChange={(e) => setPassword(e.target.value)}
                        />
                    </>
                </AdminDialog>
            </div>
        </div>
    )
}