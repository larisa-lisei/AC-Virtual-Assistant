import './LoginPage.css';
import formImage from '../../assets/login-form.png';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {TextField, Button} from '@mui/material';

export default function ActivateAccountPage() {

    useEffect(() => {
        document.body.classList.add('login-page');

        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault()

        //call backend API to authenticate user

        //successsul login - redirect to student chat page
        navigate("/student/chat");
    };

    return (
        <div className="login-card">
            <div className="login-image-container">
                <img src={formImage} alt = "Activate Account Form" className="login-image"/>
            </div>
            <div className="login-card-info">
                <h1>Welcome to<br/> AC Virtual Assistant!</h1>
                <p>Enter your credentials to activate your account</p>
                <form onSubmit = {handleSubmit}>
                    <TextField
                        label="Activation Token"
                        type="text"
                        required
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p>Account already activated? <Link to="/login">Go to login.</Link></p>
                    <Button
                        type="submit"
                        variant="contained">Activate Account
                    </Button>
                </form>
            </div>
        </div>
    )
}