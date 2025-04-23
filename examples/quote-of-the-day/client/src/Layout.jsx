// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React from "react";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "./pages/AppContext";

const Layout = ({ children }) => {
  const { currentUser, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="quote-page">
      <header className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">QuoteOfTheDay</Link>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
        <div className="navbar-right">
          {currentUser ? 
            (
              <>
                <span>Hello, {currentUser}!</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : 
            (
              <>
                <Link to="/register">Register</Link>
                <Link to="/login">Login</Link>
              </>
            )
          }
        </div>
      </header>

      <main className="quote-container">
        {children}
      </main>

      <footer>
        <p>&copy; 2024 - QuoteOfTheDay - <Link to="/privacy">Privacy</Link></p>
      </footer>
    </div>
  );
};

export default Layout;