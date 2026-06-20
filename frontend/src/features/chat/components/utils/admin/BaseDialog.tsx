import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { ReactNode } from "react";

interface BaseDialogProps {
    open: boolean;
    title: ReactNode;
    children?: ReactNode;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
}

export default function BaseDialog({
    open,
    title,
    children,
    onClose,
    onConfirm,
    confirmText,
}: BaseDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{title}</DialogTitle>

            {children && (
                <DialogContent>
                    {children}
                </DialogContent>
            )}

            <DialogActions>
                {onConfirm && (
                    <Button onClick={onConfirm} variant="contained">{confirmText}</Button>
                )}
                <Button onClick={onClose} variant="contained">Cancel</Button>
            </DialogActions>
        </Dialog>
    )
}