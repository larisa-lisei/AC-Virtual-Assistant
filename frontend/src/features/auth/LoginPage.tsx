import './LoginPage.css';
import formImage from '../../assets/login-form.png';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {TextField, Button, Snackbar, Alert} from '@mui/material';

export default function LoginPage() {

    useEffect(() => {
        document.body.classList.add('login-page');

        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        // prevent page refresh on form submit
        event.preventDefault()

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            });


            const data = await response.json();

            if(!response.ok) {
                setErrorMessage(data.detail)
                setOpenSnackBar(true);
                return;
            }

            // successful login - redirect to chat page
            navigate("/chat");
        } catch (error) {
            setErrorMessage("Something went wrong.");
            setOpenSnackBar(true);
        }
    };

    return (
    <>
        <div className="login-card">
            <div className="login-image-container">
                <img src={formImage} alt = "Login Form" className="login-image"/>
            </div>
            <div className="login-card-info">
                <h1>Welcome to<br/> AC Virtual Assistant!</h1>
                <p>Enter your credentials to access your account</p>
                <form onSubmit = {handleSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p>Account not activated? <Link to="/activate-account">Click here.</Link></p>
                    <Button
                        type="submit"
                        variant="contained">Sign In
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