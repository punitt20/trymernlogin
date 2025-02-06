import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './signup.css'; // Import the CSS file

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [suggestedPassword, setSuggestedPassword] = useState('');
    const [isHovering, setIsHovering] = useState(false); // State to track hover
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:6005/signup", {
                username,
                email,
                phone,
                password,
            });
            alert("You successfully created an account, now log in.");
            e.target.reset(); // Clear the form
            navigate("/login"); // Redirect to login page
        } catch (error) {
            console.error("Error signing up:", error.response.data);
            alert("Sign-up failed. Please try again.");
        }
    };

    const generatePassword = () => {
        const length = 12; // Length of the password
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Allowed characters
        let password = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        setSuggestedPassword(password);
    };

    const clearSuggestedPassword = () => {
        if (!isHovering) {
            setSuggestedPassword(''); // Clear the suggested password if not hovering
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignUp}>
                    <input
                        type="text"
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="tel"
                        placeholder='Phone Number'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                    <div className="password-container">
                        <input
                            type="password"
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            onMouseEnter={generatePassword} // Generate password on hover
                            onMouseLeave={clearSuggestedPassword} // Clear suggested password on hover out
                            onFocus={() => setIsHovering(true)} // Set hovering state to true
                            onBlur={() => setIsHovering(false)} // Set hovering state to false
                        />
                        {suggestedPassword && (
                            <div
                                className="suggested-password"
                                onMouseEnter={() => setIsHovering(true)} // Keep hovering state true when over the tooltip
                                onMouseLeave={clearSuggestedPassword} // Clear suggested password when leaving the tooltip
                            >
                                Suggested Password: <strong>{suggestedPassword}</strong>
                                <button type="button" onClick={() => setPassword(suggestedPassword)}>Use Suggested Password</button>
                            </div>
                        )}
                    </div>
                    <button type="submit">Sign Up</button>
                </form>
                <p>
                    <a href="/login">Already have an account? Log In</a>
                </p>
            </div>
        </div>
    );
};

export default SignUp; 