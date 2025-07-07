import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiService from "../../api/apiService";
import './login-register.css';

export function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setServerError("Email and password are required.");
      return;
    }
    try {
      const response = await apiService.login(formData);
      localStorage.setItem('user', JSON.stringify(response.data));

    
      const existingSubscription = localStorage.getItem('subscription');
      if (!existingSubscription) {
        const freeTrialSub = {
          plan: 'free_trial',
          reviewsRemaining: 1
        };
        localStorage.setItem('subscription', JSON.stringify(freeTrialSub));
      }

      navigate("/content");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setServerError(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="branding-panel">
          <div>
            <h1 className="brand-title">Securify</h1>
            <p className="brand-subtitle">Your Shield in the Digital World.</p>
          </div>
          <Link to="/" className="btn-home">
            <i className="bi bi-arrow-left me-2"></i> Back to Home
          </Link>
        </div>

        <div className="form-panel">
          <h2 className="text-center mb-4">Welcome Back</h2>
          {location.state?.message && <div className="alert alert-info">{location.state.message}</div>}
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input type="email" className="form-control" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group mb-3">
              <input 
                type={showPassword ? "text" : "password"} 
                className="form-control" 
                name="password" 
                placeholder="Enter your password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                <i className={`bi ${showPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
              </button>
            </div>
            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary">Log In</button>
            </div>
            <div className="text-center">
              <span>Don't have an account? </span>
              <Link to="/register">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}