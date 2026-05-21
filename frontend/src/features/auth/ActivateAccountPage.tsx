import './LoginPage.css';
import formImage from '../../assets/login-form.png';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {TextField, Button, Snackbar, Alert} from '@mui/material';

export default function ActivateAccountPage() {

    useEffect(() => {
        document.body.classList.add('login-page');

        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");

    const [openSnackBar, setOpenSnackBar] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [searchParams] = useSearchParams();

    const navigate = useNavigate();

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const cleanMessage = (message: string) => {
        return message.replace(/^Value error,\s*/i, "");
    };

    const getErrorMessage = (errorData: any) => {
        if(typeof errorData.detail === "string") {
            return errorData.detail;
        }

        if(Array.isArray(errorData.detail)) {
            return errorData.detail
                .map((error: any) => cleanMessage(error.msg))
                .join(" ");
        }

        return "Something went wrong.";
    };

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        // prevent page refresh on form submit
        event.preventDefault()

        const tokenFromUrl = searchParams.get("token");
        console.log("Token from URL:", tokenFromUrl);
        if(!tokenFromUrl) {
            setErrorMessage("Activation token is missing.");
            setOpenSnackBar(true);
            return;
        }

        console.log("PASSWORD: ", password);
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
                <p>Enter your activation token and set your password.</p>
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