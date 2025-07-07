import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../api/apiService";
import "../Login/login-register.css";

export function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", level: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (!formData.level) newErrors.level = "Please select your level.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const payload = { name: formData.name, email: formData.email, password: formData.password, level: parseInt(formData.level) };
      await apiService.register(payload);
      localStorage.removeItem('subscription');
      navigate("/subscription", { state: { message: "Registration successful! Please choose a plan to continue." } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
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
          <h2 className="text-center mb-4">Create Your Account</h2>
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <input type="text" className="form-control" name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange}/>
              {errors.name && <small className="text-danger">{errors.name}</small>}
            </div>
            <div className="mb-3">
              <input type="email" className="form-control" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange}/>
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>
            <div className="mb-3">
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} className="form-control" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange}/>
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi ${showPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                </button>
              </div>
              {errors.password && <small className="text-danger">{errors.password}</small>}
            </div>
            <div className="mb-3">
              <div className="input-group">
                <input type={showConfirmPassword ? "text" : "password"} className="form-control" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange}/>
                <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
            </div>
            <div className="mb-3">
              <select className="form-select" name="level" value={formData.level} onChange={handleChange}>
                <option value="" disabled>Choose your experience level...</option>
                <option value="1">Beginner: New to Tech & Security</option>
                <option value="2">Developer: Learning Secure Coding</option>
              </select>
              {errors.level && <small className="text-danger">{errors.level}</small>}
            </div>
            <div className="d-grid mb-3 mt-4">
              <button type="submit" className="btn btn-primary">Create Account</button>
            </div>
            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/login">Login now</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}