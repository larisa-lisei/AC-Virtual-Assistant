import './LoginPage.css';
import formImage from '../../assets/login-form.png';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {TextField, Button, Snackbar, Alert} from '@mui/material';
import { getErrorMessage } from '../../utils/error';

export default function ActivateAccountPage() {

    useEffect(() => {
        document.body.classList.add('login-page');

        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    const [password, setPassword] = useState("");

    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        // prevent page refresh on form submit
        event.preventDefault()

        const tokenFromUrl = searchParams.get("token");
        if(!tokenFromUrl) {
            setErrorMessage("Activation token is missing.");
            setOpenSnackBar(true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/activate-account`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({token: tokenFromUrl, password})
            });

            if(!response.ok) {
                const errorData = await response.json();
                setErrorMessage(getErrorMessage(errorData));
                setOpenSnackBar(true);
                return;
            }

            // successful activation - redirect to login page
            navigate("/login");
        } catch (error) {
            setErrorMessage("Something went wrong.");
            setOpenSnackBar(true);
        }
    };

    return (
    <>
        <div className="login-card">
            <div className="login-image-container">
                <img src={formImage} alt = "Activate Account Form" className="login-image"/>
            </div>
            <div className="login-card-info">
                <h1>Welcome to<br/> AC Virtual Assistant!</h1>
                <p>Set password here to activate your account.</p>
                <form onSubmit = {handleSubmit}>
                    <TextField
                        label="Set Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p>Account already activated? <Link to="/login">Sign in here.</Link></p>
                    <Button
                        type="submit"
                        variant="contained">Activate Account
                    </Button>
                </form>
            </div>
        </div>
        <Snackbar
            open={openSnackBar}
            autoHideDuration={4000}
            onClose={() => setOpenSnackBar(false)}
            anchorOrigin={{
                vertical: "top",
                horizontal: "right"
            }}
        >
            <Alert
                severity="error"
                onClose={() => setOpenSnackBar(false)}
            >
                {errorMessage}
            </Alert>
        </Snackbar>
    </>
    )
}