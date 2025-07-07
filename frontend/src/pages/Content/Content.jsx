import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Awareness.css";

export const topics = [
  { id: 1, title: "🔒 Password Security", description: "Learn the fundamentals of creating and managing secure passwords", keyPoints: ["Use passwords with at least 12 characters mixing letters, numbers, and symbols", "Avoid using personal information in passwords", "Utilize password managers for secure storage", "Enable two-factor authentication when available"], level: "Beginner", estimatedTime: "15 min" },
  { id: 2, title: "🎣 Phishing", description: "Recognize and avoid common phishing tactics used by cybercriminals", keyPoints: ["Check email sender addresses carefully", "Be suspicious of urgent requests for personal information", "Hover over links before clicking to view the actual URL", "Report suspicious messages to your IT department"], level: "Intermediate", estimatedTime: "20 min" },
  { id: 3, title: "📱 Mobile Device Security", description: "Protect your smartphones and tablets from security threats", keyPoints: ["Keep your operating system and apps updated", "Only download apps from official stores", "Use biometric authentication when possible", "Enable remote wipe options for lost devices"], level: "Beginner", estimatedTime: "15 min" },
  { id: 4, title: "✉️ Email Safety", description: "Secure your email communications against various threats", keyPoints: ["Never send sensitive information via unencrypted email", "Be cautious with email attachments, even from known sources", "Use email filtering and spam protection", "Consider using encrypted email services for sensitive communications"], level: "Intermediate", estimatedTime: "20 min" },
  { id: 5, title: "🌐 Secure Internet Usage", description: "Browse the web safely with essential security practices", keyPoints: ["Look for HTTPS in website URLs before entering personal information", "Use private Browse modes when on public computers", "Install a reputable ad-blocker to prevent malicious ads", "Be careful when downloading files from the internet"], level: "Beginner", estimatedTime: "25 min" },
  { id: 6, title: "🏠 Remote Work Security", description: "Implement proper security measures while working from home", keyPoints: ["Secure your home WiFi network with strong encryption", "Use company VPN services when accessing work resources", "Keep work and personal activities separate", "Follow company security policies even when at home"], level: "Intermediate", estimatedTime: "30 min" },
  { id: 7, title: "📱 Social Media Security", description: "Manage your social media presence securely", keyPoints: ["Review privacy settings regularly", "Be selective about friend/connection requests", "Limit personal information shared on public profiles", "Be aware of common social engineering tactics"], level: "Beginner", estimatedTime: "20 min" },
  { id: 8, title: "📹 Conference Call Safety", description: "Ensure security during virtual meetings and video conferences", keyPoints: ["Use meeting passwords for sensitive discussions", "Be aware of your surroundings and what's visible on camera", "Update conferencing software regularly", "Verify attendee identities before sharing sensitive information"], level: "Intermediate", estimatedTime: "15 min" },
  { id: 9, title: "🔄 System Updates", description: "Keep your devices and software up-to-date for better security", keyPoints: ["Enable automatic updates when possible", "Never skip security patches", "Maintain updated antivirus and anti-malware software", "Understand the risks of using unsupported software"], level: "Beginner", estimatedTime: "10 min" },
  { id: 10, title: "🛡️ VPN Usage", description: "Understand and properly utilize Virtual Private Networks", keyPoints: ["Use VPNs when connecting to public WiFi", "Choose reputable VPN providers", "Understand the limitations of VPN protection", "Follow company policies regarding VPN usage"], level: "Advanced", estimatedTime: "25 min" },
  { id: 11, title: "📶 Router Security", description: "Secure your network's first line of defense", keyPoints: ["Change default router credentials immediately", "Use WPA3 encryption when available", "Keep router firmware updated", "Set up guest networks for visitors"], level: "Advanced", estimatedTime: "30 min" },
];

export const achievements = {
  first_steps: { title: "First Steps", description: "Complete your first security topic", icon: "🚀" },
  halfway_there: { title: "Halfway There", description: "Complete 5 security topics", icon: "🏆" },
  security_master: { title: "Security Master", description: "Complete all security topics", icon: "🔒" },
  beginner_master: { title: "Beginner Master", description: "Complete all beginner level topics", icon: "🎓" },
  quiz_ace: { title: "Quiz Ace", description: "Score 100% on a security quiz", icon: "🎯" },
};


export const getTopicById = (id) => {
  return topics.find((topic) => topic.id === parseInt(id));
};

export const useProgressTracking = () => {
  const [progress, setProgress] = useState(() => {
    const savedProgress = localStorage.getItem("securityProgress");
    return savedProgress
      ? JSON.parse(savedProgress)
      : {
          completedTopics: [],
          quizScores: {},
          lastActivity: null,
          topicsStarted: [],
          achievements: [],
        };
  });

  useEffect(() => {
    localStorage.setItem("securityProgress", JSON.stringify(progress));
  }, [progress]);

  const updateAchievements = () => {
    setProgress(prev => {
      let newAchievements = [...prev.achievements];
      
      const completedTopics = prev.completedTopics;
      const beginnerTopics = topics.filter(t => t.level === "Beginner").map(t => t.id);
      const allBeginnersCompleted = beginnerTopics.every(id => completedTopics.includes(id));

      if (completedTopics.length >= 1 && !newAchievements.includes("first_steps")) newAchievements.push("first_steps");
      if (completedTopics.length >= 5 && !newAchievements.includes("halfway_there")) newAchievements.push("halfway_there");
      if (allBeginnersCompleted && !newAchievements.includes("beginner_master")) newAchievements.push("beginner_master");
      if (completedTopics.length === topics.length && !newAchievements.includes("security_master")) newAchievements.push("security_master");

      const scores = Object.values(prev.quizScores);
      if (scores.some(score => score === 100) && !newAchievements.includes("quiz_ace")) {
        newAchievements.push("quiz_ace");
      }

      if (JSON.stringify(newAchievements) !== JSON.stringify(prev.achievements)) {
        return { ...prev, achievements: newAchievements };
      }
      
      return prev; 
    });
  };

  const markTopicCompleted = (topicId) => {
    const topicIdInt = parseInt(topicId);
    setProgress(prev => {
      if (prev.completedTopics.includes(topicIdInt)) {
        return prev;
      }
      return {
        ...prev,
        completedTopics: [...prev.completedTopics, topicIdInt],
        lastActivity: new Date().toISOString()
      };
    });
  };

  const saveQuizScore = (topicId, score) => {
    setProgress(prev => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [topicId]: score
      },
      lastActivity: new Date().toISOString()
    }));
  };
  
  useEffect(() => {
    updateAchievements();
  }, [progress.completedTopics, progress.quizScores]);


  const getCompletionPercentage = () => {
    if (topics.length === 0) return 0;
    const validCompletedTopics = progress.completedTopics.filter(topicId =>
        topics.some(topic => topic.id === topicId)
    );
    return Math.round((validCompletedTopics.length / topics.length) * 100);
  };

  const isTopicCompleted = (topicId) => {
    return progress.completedTopics.includes(parseInt(topicId));
  };

  const isTopicStarted = (topicId) => {
    return (
      progress.topicsStarted.includes(parseInt(topicId)) &&
      !isTopicCompleted(topicId)
    );
  };

  const markTopicStarted = (topicId) => {
    if (!progress.topicsStarted.includes(parseInt(topicId))) {
      setProgress((prev) => ({
        ...prev,
        topicsStarted: [...prev.topicsStarted, parseInt(topicId)],
        lastActivity: new Date().toISOString(),
      }));
    }
  };

  const resetProgress = () => {
    setProgress({
      completedTopics: [],
      quizScores: {},
      lastActivity: new Date().toISOString(),
      topicsStarted: [],
      achievements: [],
    });
  };

  const getLastActivityFormatted = () => {
    if (!progress.lastActivity) return "No activity yet";
    const lastDate = new Date(progress.lastActivity);
    const now = new Date();
    if (lastDate.toDateString() === now.toDateString()) {
      return "Today";
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (lastDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return lastDate.toLocaleDateString();
  };

  return {
    progress,
    getCompletionPercentage,
    isTopicCompleted,
    isTopicStarted,
    markTopicStarted,
    markTopicCompleted,
    saveQuizScore,
    resetProgress,
    getLastActivityFormatted,
  };
};


export function Content() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);

  const {
    getCompletionPercentage,
    isTopicCompleted,
    isTopicStarted,
    markTopicStarted,
    getLastActivityFormatted,
    progress,
  } = useProgressTracking();

  const categories = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);

      const subscription = localStorage.getItem('subscription');
      if (!subscription) {
          navigate('/subscription');
          return; 
      }

    } else {
      navigate("/login");
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || topic.level === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStartTopic = (e, topicId) => {
    e.stopPropagation();
    markTopicStarted(topicId);
    navigate(`/topic/${topicId}`);
  };

  const getTopicStatus = (topicId) => {
    if (isTopicCompleted(topicId)) return "Completed";
    if (isTopicStarted(topicId)) return "In Progress";
    return "Not Started";
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed": return "bg-success";
      case "In Progress": return "bg-warning";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="awareness">
      <div className="cc">
        <div className="h-100 d-flex flex-column"> 
          <nav className="navbar navbar-expand flex-shrink-0 ps-3 pe-3">
            <NavLink className="navbar-brand me-auto navlogo" to="/">
              <img src="/logo.png" alt="Securify Logo" height="50" className="d-inline-block justify-content-center align-items-center me-2" style={{ marginTop: "-10px", marginBottom: "-5px" }} />
              Securify
            </NavLink>
            <div className="navbar-nav ms-auto d-flex align-items-center">
              {user && parseInt(user.level) === 2 && (
                <li className="nav-item pe-2">
                  <button className="btn btn-outline-info fw-bolder border-2 mt-1" onClick={() => navigate("/training")}>
                    <i className="bi bi-code-slash me-1"></i> Code Training
                  </button>
                </li>
              )}
              <li className="nav-item pe-2">
                <button className="btn btn-outline-primary fw-bolder border-2 mt-1" onClick={() => navigate("/content/quiz")}>
                  <i className="bi bi-question-circle me-1"></i> Take Quiz
                </button>
              </li>
              <li className="nav-item pe-2">
                <button className="btn btn-outline-success fw-bolder border-2 mt-1" onClick={() => navigate("/account")}>
                  <i className="bi bi-person-circle me-1"></i> My Account
                </button>
              </li>
            </div>
          </nav>
          <div className="flex-grow-1" style={{ overflowY: 'auto' }}>
            <div className="container mt-4 text-center">
              <h1 className="display-5 fw-bold">Securify</h1>
              <p className="lead">Welcome, {user ? user.name : 'Guest'}! Enhance your cybersecurity knowledge.</p>
            </div>
            <div className="container d-flex justify-content-center align-items-center mt-3 flex-wrap">
              <div className="input-group me-3" style={{ maxWidth: "400px" }}>
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input placeholder="Search topics..." type="text" className="form-control search-bar" value={searchQuery} onChange={handleSearchChange} />
              </div>
              <div className="category-filter d-flex align-items-center me-3">
                <span className="me-2">Filter:</span>
                <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
                </select>
              </div>
              <div className="view-toggle d-flex align-items-center">
                <span className="me-2">View:</span>
                <div className="btn-group" role="group">
                  <button className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("grid")}><i className="bi bi-grid-3x3-gap-fill"></i></button>
                  <button className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setViewMode("list")}><i className="bi bi-list-ul"></i></button>
                </div>
              </div>
            </div>
            <div className="container-fluid h-100 p-4">
              {isLoading ? (
                <div className="text-center my-5">
                  <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                  <p className="mt-2">Loading security topics...</p>
                </div>
              ) : filteredTopics.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="row g-4">
                    {filteredTopics.map((topic) => {
                      const topicStatus = getTopicStatus(topic.id);
                      return (
                        <div key={topic.id} className="col-xl-4 col-md-6 text-center">
                          <div className="card h-100 clickable-card" onClick={() => navigate(`/topic/${topic.id}`)} style={{ cursor: "pointer", width: "97%", margin: "0 auto" }}>
                            <div className="position-relative">
                              <div className="square-img-container">
                                <img src={`/AwarenessImages/${topic.id}.jpg`} className="card-img-top square-img" alt={topic.title} onError={(e) => { e.target.src = "/AwarenessImages/default.jpg"; }} />
                              </div>
                              <div className="position-absolute top-0 end-0 m-2"><span className={`badge ${topic.level === "Beginner" ? "bg-success" : topic.level === "Intermediate" ? "bg-warning" : "bg-danger"}`}>Level: {topic.level}</span></div>
                              <div className="position-absolute bottom-0 start-0 m-2"><span className="badge bg-info"><i className="bi bi-clock me-1"></i> {topic.estimatedTime}</span></div>
                              <div className="position-absolute bottom-0 end-0 m-2"><span className={`badge ${getStatusBadgeColor(topicStatus)}`}><i className={`bi ${topicStatus === "Completed" ? "bi-check-circle" : topicStatus === "In Progress" ? "bi-play-circle" : "bi-circle"} me-1`}></i>{topicStatus}</span></div>
                            </div>
                            <div className="card-body">
                              <h3>{topic.title}</h3>
                              <p className="topic-desc-font">{topic.description}</p>
                            </div>
                            <div className="card-footer">
                              <button className={`btn ${topicStatus === "Completed" ? "btn-success" : topicStatus === "In Progress" ? "btn-warning" : "btn-primary"}`} onClick={(e) => handleStartTopic(e, topic.id)}>
                                {topicStatus === "Completed" ? "Review Again" : topicStatus === "In Progress" ? "Continue" : "Start Learning"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="list-group">
                    {filteredTopics.map((topic) => {
                      const topicStatus = getTopicStatus(topic.id);
                      return (
                        <div key={topic.id} className="list-group-item list-group-item-action p-3 mb-2 rounded" onClick={() => navigate(`/topic/${topic.id}`)} style={{ cursor: "pointer" }}>
                          <div className="row align-items-center">
                            <div className="col-md-7">
                              <h5 className="mb-1">{topic.title}</h5>
                              <p className="mb-1 text-secondary">{topic.description}</p>
                            </div>
                            <div className="col-md-3">
                              <div className="d-flex flex-column align-items-start">
                                <span className={`badge ${topic.level === "Beginner" ? "bg-success" : topic.level === "Intermediate" ? "bg-warning" : "bg-danger"} mb-1`}>Level: {topic.level}</span>
                                <span className="badge bg-info"><i className="bi bi-clock me-1"></i> {topic.estimatedTime}</span>
                              </div>
                            </div>
                            <div className="col-md-2 text-end">
                              <span className={`badge ${getStatusBadgeColor(topicStatus)} mb-2 d-block`}>{topicStatus}</span>
                              <button className={`btn btn-sm ${topicStatus === "Completed" ? "btn-success" : topicStatus === "In Progress" ? "btn-warning" : "btn-primary"}`} onClick={(e) => handleStartTopic(e, topic.id)}>
                                {topicStatus === "Completed" ? "Review" : topicStatus === "In Progress" ? "Continue" : "Start"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="col-12 text-center my-5">
                  <i className="bi bi-search" style={{ fontSize: "3rem", color: "#ccc" }}></i>
                  <h3 className="mt-3">No matching topics found</h3>
                  <p className="text-muted">Try adjusting your search or filters</p>
                  <button className="btn btn-outline-primary mt-2" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>Clear Filters</button>
                </div>
              )}
            </div>
            <div className="container my-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Your Security Progress</h4>
                  <div className="progress mb-3" style={{ height: "20px" }}>
                    <div className="progress-bar" role="progressbar" style={{ width: `${getCompletionPercentage()}%`, backgroundColor: 'var(--primary-color)' }} aria-valuenow={getCompletionPercentage()} aria-valuemin="0" aria-valuemax="100" >
                      {getCompletionPercentage()}% Complete
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Topics Completed: {progress.completedTopics.length}/{topics.length}</span>
                    <span>Last Activity: {getLastActivityFormatted()}</span>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => navigate("/account")}>View Detailed Progress</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="py-3 mt-auto flex-shrink-0">
            <div className="container text-center">
              <p className="mb-0">© 2025 Securify |<Link to="/about" className="ms-1 me-1">About</Link> |<Link to="/contact" className="ms-1">Contact</Link></p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}