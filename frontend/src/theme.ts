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
    },
});