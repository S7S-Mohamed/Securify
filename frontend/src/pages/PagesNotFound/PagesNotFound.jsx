import React from "react";
import { useNavigate } from "react-router-dom";
import "./PageNotFound.css";

export function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-message">Oops! Page Not Found</h2>
        <p className="error-description">
          The page you are looking for might have been removed, 
          had its name changed, or is temporarily unavailable.
        </p>
        <button 
          className="home-button"
          onClick={() => navigate("/")}
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}