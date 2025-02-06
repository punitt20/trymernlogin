import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:6005/forgot-password", { identifier });
            alert("OTP sent to your email or phone.");
            setStep(2);
        } catch (error) {
            console.error("Error sending OTP:", error.response.data);
            alert(error.response.data.message || "Failed to send OTP. Please try again.");
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:6005/verify-otp", { identifier, otp });
            alert("OTP verified. You can now update your password.");
            setStep(3);
        } catch (error) {
            console.error("Error verifying OTP:", error.response.data);
            alert(error.response.data.message || "Failed to verify OTP. Please try again.");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:6005/update-password", { identifier, newPassword });
            alert("Password updated successfully.");
            setStep(1);
        } catch (error) {
            console.error("Error updating password:", error.response.data);
            alert(error.response.data.message || "Failed to update password. Please try again.");
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h1>Forgot Password</h1>
                {step === 1 && (
                    <form onSubmit={handleForgotPassword}>
                        <input
                            type="text"
                            placeholder='Email or Phone Number'
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        <button type="submit">Send OTP</button>
                    </form>
                )}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <input
                            type="text"
                            placeholder='Enter OTP'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit">Verify OTP</button>
                    </form>
                )}
                {step === 3 && (
                    <form onSubmit={handleUpdatePassword}>
                        <input
                            type="password"
                            placeholder='New Password'
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Update Password</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword; 