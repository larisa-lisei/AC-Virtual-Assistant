import './LoginPage.css';
import formImage from '../../assets/login-form.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {TextField, Button} from '@mui/material';

export default function LoginPage() {

    useEffect(() => {
        document.body.classList.add('login-page');

        return () => {
            document.body.classList.remove('login-page');
        };
    }, []);

    const [email, setEmail] = useState("");
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
                <img src={formImage} alt = "Login Form" className="login-image"/>
            </div>
            <div className="login-card-info">
                <div>
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
                        <Button
                            type="submit"
                            variant="contained">Sign In
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}