import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#1B2058',
        },
    },
    typography: {
        fontFamily: 'Comme, "Times New Roman", Times, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 'bold',
                    width: 'fit-content',
                },
                contained: {
                    backgroundColor: '#1B2058',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#101442',
                    },
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&.Mui-selected .MuiTypography-root': {
                        color: '#1B2058',
                    },
                    '&.leaf-button.Mui-selected': {
                        backgroundColor: '#1B2058',
                    },
                    '&.leaf-button.Mui-selected .MuiTypography-root': {
                        color: 'white',
                    },
                },
            },
        },
        MuiListItemText: {
            styleOverrides : {
                primary: {
                    fontWeight: 650,
                    color: 'rgb(93, 93, 93)',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '.MuiTableBody-root &' : {
                        '&:hover': {
                            background: 'rgb(235, 237, 255)',
                        },
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    color: '#1B2058',
                    fontWeight: 700,
                    fontSize: '1.1em',
                    borderBottom: '2px solid #1B2058'
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                root: {
                    textAlign: 'center',
                },
                paper: {
                    borderRadius: 15,
                    padding: 20,
                    border: '4px solid #1B2058',
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    color: '#1B2058',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    justifyContent: 'center' 
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    margin: 20
                }
            }
        }
    },
});