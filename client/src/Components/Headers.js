import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './header.css';

const Headers = () => {
    const [userdata, setUserdata] = useState(null);

    const getUser = async () => {
        try {
            const response = await axios.get("http://localhost:6005/login/success", { withCredentials: true });
            console.log("User data:", response.data.user); // Debugging line
            setUserdata(response.data.user);
        } catch (error) {
            console.log("Error fetching user data:", error);
        }
    };

    const logout = async () => {
        try {
            await axios.get("http://localhost:6005/logout", { withCredentials: true });
            setUserdata(null);
        } catch (error) {
            console.log("Error logging out:", error);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <header>
            <nav>
                <div className="left">
                    <h1>Mern Login</h1>
                </div>
                <div className="right">
                    <ul>
                        <li>
                            <NavLink to="/">Home</NavLink>
                        </li>
                        {userdata ? (
                            <>
                                <li style={{ color: "black", fontWeight: "bold" }}>{userdata.displayName}</li>
                                <li>
                                    <NavLink to="/dashboard">Dashboard</NavLink>
                                </li>
                                <li onClick={logout} style={{ cursor: "pointer" }}>Logout</li>
                                <li>
                                    <img src={userdata.image} style={{ width: "50px", borderRadius: "50%" }} alt="" />
                                </li>
                            </>
                        ) : (
                            <li>
                                <NavLink to="/login">Login</NavLink>
                            </li>
                        )}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Headers;