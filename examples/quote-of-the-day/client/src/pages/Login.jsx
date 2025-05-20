// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "./AppContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {

    e.preventDefault();

    // Retrieve user from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((user) => user.username === username && user.password === password);

    if (user) {
      loginUser(username);
      navigate("/");
    }
    else {
      setMessage("Invalid username or password!");
    }
  };

  return (
    <div className="register-login-card">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="input-container">
          <label>Username</label>
          <input 
            type="text" 
            placeholder="Enter username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div className="input-container">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit" className="register-login-button">Login</button>
      </form>
      <div className="error-message">
        <p>{message}</p>
      </div>
    </div>
  );
};
  
export default Login;