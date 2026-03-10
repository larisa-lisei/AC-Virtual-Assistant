import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { ReactNode } from "react";

interface AdminDialogProps {
    open: boolean;
    title: ReactNode;
    children?: ReactNode;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
}

export default function AdminDialog({
    open,
    title,
    children,
    onClose,
    onConfirm,
    confirmText,
}: AdminDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>

            {children && (
                <DialogContent>
                    {children}
                </DialogContent>
            )}

            <DialogActions>
                <Button onClick={onConfirm} variant="contained">{confirmText}</Button>
                <Button onClick={onClose} variant="contained">Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}