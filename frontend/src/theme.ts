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
    },
});