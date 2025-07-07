import { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import ReactPlayer from "react-player";
import './topic.css';
import { getTopicById, useProgressTracking } from "../Content/Content";

export function Topic() {
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [topic, setTopic] = useState(null);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();

  const { markTopicCompleted, isTopicCompleted } = useProgressTracking();

  useEffect(() => {
    try {
      const currentTopic = getTopicById(id);

      if (!currentTopic) {
        throw new Error("Topic not found");
      }

      setTopic(currentTopic);
      setLoading(false);
    } catch (err)
    {
      console.error("Error:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [id]);

  const handleMarkAsComplete = () => {
    markTopicCompleted(id);
    setTimeout(() => {
      navigate("/content");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="text-center mt-5">
        <h2>Error Loading Content</h2>
        <p className="text-muted">{error || "Topic not found"}</p>
        <div className="mt-3">
          <button
            className="btn btn-outline-primary ms-2"
            onClick={() => navigate("/content")}
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const videoUrl = `${process.env.PUBLIC_URL}/Videos/${topic.id}.mp4`;

  return (
    <div className="topic">
      <div className="background"></div>
      <div className="bod vh-100">
        <div className="card h-100 shadow border-0">
          <nav
            className="navbar navbar-expand flex-shrink-0 ps-3 pe-3"
            style={{ height: "55px", overflow: "hidden" }}
          >
            <NavLink className="navbar-brand pb-3 me-auto navlogo" to="/">
              <img
                src="/logo.png"
                alt="Securify Logo"
                height="50"
                className="d-inline-block justify-content-center align-items-center me-2"
                style={{ marginTop: "-10px", marginBottom: "-5px" }}
              />
              Securify
            </NavLink>
            <div className="navbar-nav ms-auto">
              <li className="nav-item pe-2">
                <button
                  className="btn btn-outline-primary fw-bolder border-2 mt-1"
                  onClick={() => navigate("/content")}
                >
                  Topics
                </button>
              </li>
            </div>
          </nav>
          <div className="container-fluid h-100">
            <div className="row h-100 ">
              <div className="col-xl-6">
                <div className="content-container h-100">
                  <div>
                    <h2 className="ps-2 pb-2 responsive-title">
                      {topic.title}
                    </h2>

                    <div className="responsive-content">
                        <p className="topic-description">{topic.description}</p>
                        <h4 className="mt-4">Key Points:</h4>
                        <ul>
                            {topic.keyPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="completion-area mt-auto pt-4">
                      {isTopicCompleted(id) ? (
                        <p className="completion-message">
                          ✓ Topic Already Completed!
                        </p>
                      ) : (
                        <button
                          className="btn btn-complete"
                          onClick={handleMarkAsComplete}
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-6 d-flex justify-content-center align-items-center">
                <div className="player-wrapper">
                  <div className="react-player">
                    {videoLoading && (
                      <div className="player-loading">
                        <div className="player-loading-spinner"></div>
                      </div>
                    )}
                    <ReactPlayer
                      className="Vid"
                      url={videoUrl}
                      width="100%"
                      height="100%"
                      controls={true}
                      onReady={() => setVideoLoading(false)}
                      onBuffer={() => setVideoLoading(true)}
                      onBufferEnd={() => setVideoLoading(false)}
                      onError={(e) => {
                        console.error('Video Error:', e);
                        console.error('Attempted to load video from:', videoUrl);
                        setVideoLoading(false); 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}