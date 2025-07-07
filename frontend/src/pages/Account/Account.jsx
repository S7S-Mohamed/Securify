import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProgressTracking, achievements, getTopicById, topics } from "../Content/Content";
import apiService from "../../api/apiService";
import "./Account.css";

function ProfileSettings({ user, setUser }) {
    const [name, setName] = useState(user.name);
    const [level, setLevel] = useState(user.level);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [levelMessage, setLevelMessage] = useState({ type: '', text: '' });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage({ type: '', text: '' });
        if (name === user.name) {
            setProfileMessage({ type: 'info', text: 'You have not made any changes.' });
            return;
        }
        try {
            await apiService.updateProfile({ name });
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
            const updatedUser = { ...user, name };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'An error occurred.';
            setProfileMessage({ type: 'danger', text: `Error: ${errorMsg}` });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMessage({ type: '', text: '' });
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordMessage({ type: 'danger', text: 'New passwords do not match.' });
            return;
        }
        try {
            await apiService.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'An error occurred.';
            setPasswordMessage({ type: 'danger', text: `Error: ${errorMsg}` });
        }
    };

    const handleLevelUpdate = async (e) => {
        e.preventDefault();
        setLevelMessage({ type: '', text: '' });
        const newLevel = parseInt(level);
        if (newLevel === user.level) {
            setLevelMessage({ type: 'info', text: 'You are already on this level.' });
            return;
        }
        try {
            await apiService.updateLevel({ level: newLevel });
            setLevelMessage({ type: 'success', text: 'Account level updated successfully!' });
            const updatedUser = { ...user, level: newLevel };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
             const errorMsg = error.response?.data?.message || 'An error occurred.';
            setLevelMessage({ type: 'danger', text: `Error: ${errorMsg}` });
        }
    };

    return (
        <div className="row g-4">
            <div className="col-lg-6">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title mb-3"><i className="bi bi-person-fill me-2"></i>Update Profile</h5>
                        {profileMessage.text && <div className={`alert alert-${profileMessage.type}`}>{profileMessage.text}</div>}
                        <form onSubmit={handleProfileUpdate}>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Email Address</label>
                                <input type="email" id="email" className="form-control" value={user.email} disabled readOnly />
                                <div className="form-text">Your email address cannot be changed.</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">Name</label>
                                <input type="text" id="name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary">Save Name</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="col-lg-6">
                 <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title mb-3"><i className="bi bi-key-fill me-2"></i>Change Password</h5>
                         {passwordMessage.text && <div className={`alert alert-${passwordMessage.type}`}>{passwordMessage.text}</div>}
                        <form onSubmit={handlePasswordUpdate}>
                            <div className="mb-3">
                                <label htmlFor="currentPassword"  className="form-label">Current Password</label>
                                <input type="password" id="currentPassword"  className="form-control" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} required/>
                            </div>
                             <div className="mb-3">
                                <label htmlFor="newPassword"  className="form-label">New Password</label>
                                <input type="password" id="newPassword"  className="form-control" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required/>
                            </div>
                             <div className="mb-3">
                                <label htmlFor="confirmPassword"  className="form-label">Confirm New Password</label>
                                <input type="password" id="confirmPassword"  className="form-control" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required/>
                            </div>
                            <button type="submit" className="btn btn-primary">Change Password</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="col-12">
                 <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title mb-3"><i className="bi bi-reception-4 me-2"></i>Change Account Level</h5>
                        {levelMessage.text && <div className={`alert alert-${levelMessage.type}`}>{levelMessage.text}</div>}
                        <form onSubmit={handleLevelUpdate}>
                             <div className="mb-3">
                                <label htmlFor="level" className="form-label">Account Type</label>
                                <select id="level" className="form-select" value={level} onChange={e => setLevel(e.target.value)}>
                                    <option value="1">General Awareness</option>
                                    <option value="2">Secure Coder</option>
                                </select>
                                <div className="form-text">Changing to Secure Coder will grant you access to the AI Code Training page.</div>
                            </div>
                            <button type="submit" className="btn btn-primary">Save Level</button>
                        </form>
                    </div>
                 </div>
            </div>
        </div>
    );
}

export function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("progress");

  const { progress } = useProgressTracking();
  const allTopics = topics;

  const validCompletedTopics = progress.completedTopics.filter(topicId =>
      allTopics.some(topic => topic.id === topicId)
  );
  
  const completionPercentage = allTopics.length > 0
      ? Math.round((validCompletedTopics.length / allTopics.length) * 100)
      : 0;

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
    } else {
        navigate('/login');
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("securityProgress");
    localStorage.removeItem("subscription");
    setUser(null);
    navigate("/login");
  };

  const getAchievementInfo = (achievementId) => {
    return (
      achievements[achievementId] || {
        title: "Unknown Achievement",
        description: "Achievement details not available",
        icon: "❓",
      }
    );
  };

  if (isLoading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading your account...</span>
      </div>
    );
  }

  return (
    <div className="awareness">
      <div className="cc">
        <div className="account-page d-flex flex-column h-100">
          <nav className="navbar navbar-expand flex-shrink-0 ps-3 pe-3">
            <Link className="navbar-brand me-auto navlogo" to="/">
              <img
                src="/logo.png"
                alt="Securify Logo"
                height="50"
                className="d-inline-block align-items-center me-2"
                style={{ marginTop: "-10px", marginBottom: "-5px" }}
              />
              Securify
            </Link>
            <div className="navbar-nav ms-auto">
              <li className="nav-item">
                <button
                  className="btn btn-outline-primary fw-bolder border-2"
                  onClick={() => navigate("/content")}
                >
                  <i className="bi bi-grid-3x3-gap me-1"></i> All Topics
                </button>
              </li>
              <li className="nav-item ms-2">
                 <button className="btn btn-outline-danger fw-bolder border-2" onClick={handleLogout}>
                   <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </li>
            </div>
          </nav>
          
          <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
            <div className="container mt-4 text-center">
                <h1 className="display-5 fw-bold">My Account</h1>
                <p className="lead text-secondary">
                Manage your profile and track your learning journey
                </p>
            </div>

            <div className="container mt-4">
                <ul className="nav nav-pills mb-4 justify-content-center">
                <li className="nav-item">
                    <button
                    className={`nav-link ${activeTab === "progress" ? "active" : ""}`}
                    onClick={() => setActiveTab("progress")}
                    >
                    <i className="bi bi-graph-up me-1"></i> My Progress
                    </button>
                </li>
                <li className="nav-item">
                    <button
                    className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
                    onClick={() => setActiveTab("settings")}
                    >
                    <i className="bi bi-gear-fill me-1"></i> Profile Settings
                    </button>
                </li>
                </ul>
            </div>
            
            <div className="container-fluid p-4">
                {activeTab === 'settings' && <ProfileSettings user={user} setUser={setUser} />}

                {activeTab === 'progress' && (
                    <>
                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-3 text-center mb-3 mb-md-0">
                                        <div className="progress-circle mx-auto position-relative" style={{ width: "120px", height: "120px" }}>
                                            <svg viewBox="0 0 36 36" className="position-absolute top-0 start-0" width="120" height="120">
                                                <path className="track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                                                <path className="progress-line" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeDasharray={`${completionPercentage}, 100`} />
                                            </svg>
                                            <div className="position-absolute top-50 start-50 translate-middle progress-text">
                                                <h3 className="mb-0">{completionPercentage}%</h3>
                                                <p className="mb-0 small">Complete</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-9">
                                        <div className="row">
                                            <div className="col-md-6 mb-3 mb-md-0">
                                                <div className="card summary-card h-100">
                                                    <div className="card-body text-center">
                                                        <i className="bi bi-journal-check text-success mb-2" style={{ fontSize: "2rem" }}></i>
                                                        <h5>Topics Completed</h5>
                                                        <h3>{validCompletedTopics.length} / {allTopics.length}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card summary-card h-100">
                                                    <div className="card-body text-center">
                                                        <i className="bi bi-trophy text-warning mb-2" style={{ fontSize: "2rem" }}></i>
                                                        <h5>Achievements</h5>
                                                        <h3>{progress.achievements.length} / {Object.keys(achievements).length}</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h4 className="mb-3">Achievements Unlocked</h4>
                                        {progress.achievements.length > 0 ? (
                                            <div className="row g-3">
                                                {progress.achievements.map(id => {
                                                    const achievement = getAchievementInfo(id);
                                                    return (
                                                        <div key={id} className="col-md-6 d-flex">
                                                            <div className="d-flex align-items-center p-2 rounded w-100 achievement-item">
                                                                <span className="fs-2 me-3">{achievement.icon}</span>
                                                                <div>
                                                                    <h6 className="mb-0">{achievement.title}</h6>
                                                                    <small>{achievement.description}</small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : <div className="alert alert-info">You have not unlocked any achievements yet.</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 mb-4">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h4 className="mb-3">Quiz Results</h4>
                                        {Object.keys(progress.quizScores).length > 0 ? (
                                        <div className="row g-3">
                                            {Object.entries(progress.quizScores).map(([topicId, score]) => {
                                                const topicTitle = topicId === 'general_quiz' ? "General Security Quiz" : getTopicById(parseInt(topicId))?.title;
                                                if (!topicTitle) return null;

                                                const passed = score >= 80;
                                                return (
                                                    <div key={topicId} className="col-md-6 d-flex">
                                                        <div className="d-flex align-items-center p-2 rounded w-100 achievement-item">
                                                            <span className={`fs-2 me-3 ${passed ? 'text-success' : 'text-danger'}`}>
                                                                <i className={`bi ${passed ? 'bi-patch-check-fill' : 'bi-x-circle-fill'}`}></i>
                                                            </span>
                                                            <div>
                                                                <h6 className="mb-0">{topicTitle}</h6>
                                                                <small>Score: {score}% - <span className={passed ? 'fw-bold' : ''}>{passed ? "Passed" : "Failed"}</span></small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        ) : <div className="alert alert-info">You haven't taken any quizzes yet.</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
          </div>
          
          <footer className="py-3 mt-auto flex-shrink-0">
            <div className="container text-center">
              <p className="mb-0">© 2025 Securify</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}