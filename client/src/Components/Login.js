import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'; // Import the CSS file

const Login = () => {
    const [identifier, setIdentifier] = useState(''); // This will hold either email or phone
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:6005/login", {
                identifier, // Send the identifier (email or phone)
                password,
            });
            console.log("User logged in:", response.data);
            if (response.data.success) {
                localStorage.setItem("displayName", response.data.displayName);
                navigate("/dashboard");
            } else {
                alert("Login failed. Please check your credentials.");
            }
        } catch (error) {
            if (error.response) {
                console.error("Error logging in:", error.response.data);
                alert("Login failed: " + error.response.data.message);
            } else {
                console.error("Error logging in:", error);
                alert("Login failed: " + error.message);
            }
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder='Email or Phone Number'
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p>
                    <a href="/signup">Don't have an account? Sign Up</a>
                </p>
                <button onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
                <button className="google-btn" onClick={() => window.open("http://localhost:6005/auth/google/callback", "_self")}>
                    Sign In With Google
                </button>
            </div>
        </div>
    );
};

export default Login