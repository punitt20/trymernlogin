import axios from 'axios';
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const getUser = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:6005/login/success", { withCredentials: true });
      console.log("response", response);
    } catch (error) {
      console.error("Error fetching user data:", error);
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  // Retrieve the display name from local storage
  const displayName = localStorage.getItem("displayName");

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Dashboard</h1>
      {displayName && <h2>Welcome, {displayName}!</h2>}
    </div>
  );
};

export default Dashboard;