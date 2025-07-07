import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './Training.css';

const initialCode = `const express = require('express');
const mysql = require('mysql');

// Vulnerability: Hardcoded Credentials
const dbPassword = "MySuperSecretPassword123!";

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: dbPassword,
  database: 'mydatabase'
});

// Vulnerability: SQL Injection
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const sqlQuery = "SELECT * FROM users WHERE id = '" + userId + "'";

  connection.query(sqlQuery, (err, results) => {
    if (err) {
      return res.status(500).send("Error executing query.");
    }
    res.json(results);
  });
});`;

function Training() {
  const navigate = useNavigate();
  const [code, setCode] = useState(initialCode);
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
        const foundUser = JSON.parse(loggedInUser);
        if (parseInt(foundUser.level) !== 2) {
            navigate("/content");
        }
    } else {
        navigate("/login");
    }

    const sub = JSON.parse(localStorage.getItem('subscription'));
    setSubscription(sub);

  }, [navigate]);

  const handleAnalyze = async () => {
    if (!subscription || (subscription.plan !== 'unlimited' && subscription.reviewsRemaining <= 0)) {
        setError("You have no code reviews remaining. Please upgrade your plan to get more.");
        return;
    }

    setIsLoading(true);
    setError('');
    setReport('');

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', {
        code: code,
      }, { withCredentials: true });
      setReport(response.data.report);

      if (subscription.plan !== 'unlimited') {
          const newSubscription = { ...subscription, reviewsRemaining: subscription.reviewsRemaining - 1 };
          setSubscription(newSubscription);
          localStorage.setItem('subscription', JSON.stringify(newSubscription));
      }

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'An unexpected error occurred.';
      setError(`Analysis failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const vscodeLikeOptions = {
    automaticLayout: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    bracketPairColorization: {
        enabled: true,
    },
    codeLens: true,
    contextmenu: true,
    copyWithSyntaxHighlighting: true,
    cursorSmoothCaretAnimation: 'on',
    cursorStyle: 'line',
    dragAndDrop: true,
    folding: true,
    fontFamily: 'monospace',
    fontSize: 14,
    formatOnPaste: true,
    formatOnType: true,
    glyphMargin: true,
    links: true,
    lightbulb: {
        enabled: true,
    },
    lineHeight: 24,
    matchBrackets: 'always',
    minimap: {
        enabled: true,
    },
    mouseWheelZoom: true,
    multiCursorModifier: 'ctrlCmd',
    parameterHints: {
        enabled: true,
    },
    quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
    },
    readOnly: false,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    selectOnLineNumbers: true,
    selectionClipboard: true,
    smoothScrolling: true,
    suggestOnTriggerCharacters: true,
    wordBasedSuggestions: true,
    wordWrap: 'on',
  };
  
  const reviewsLeft = subscription ? (subscription.plan === 'unlimited' ? 'Unlimited' : subscription.reviewsRemaining) : 0;
  const noReviews = reviewsLeft === 0;

  return (
    <div className="awareness">
      <div className="background"></div>
      <div className="cc">
          <nav className="navbar navbar-expand flex-shrink-0 ps-3 pe-3" style={{ height: "60px", overflow: "hidden" }}>
            <NavLink className="navbar-brand me-auto navlogo" to="/">
              <img src="/logo.png" alt="Securify Logo" height="50" className="d-inline-block align-text-top me-2" style={{ marginTop: "-10px", marginBottom: "-5px" }}/>
              Securify
            </NavLink>
            <div className="navbar-nav ms-auto">
              <li className="nav-item pe-2">
                <button className="btn btn-outline-primary fw-bolder border-2 mt-1" onClick={() => navigate("/content")}>
                  <i className="bi bi-arrow-left-circle me-1"></i> All Topics
                </button>
              </li>
               <li className="nav-item">
                <button className="btn btn-outline-success fw-bolder border-2 mt-1" onClick={() => navigate("/account")}>
                  <i className="bi bi-person-circle me-1"></i> My Account
                </button>
              </li>
            </div>
          </nav>

          <div className="container-fluid p-4 flex-grow-1">
            <header className="text-center mb-4">
              <h1 className="display-5 fw-bold">AI-Powered Secure Code Reviewer</h1>
              <p className="lead">Analyze your code snippets for vulnerabilities. </p>
              <p className="fw-bold">Reviews remaining: {reviewsLeft}</p>
            </header>

            <main className="App-main">
              <div className="editor-container">
                <h3 className="h4">Your Code</h3>
                <div className="card shadow-sm">
                  <Editor
                    height="50vh"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={vscodeLikeOptions}
                  />
                </div>
                <button className="btn btn-primary btn-lg mt-3" onClick={handleAnalyze} disabled={isLoading || noReviews}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Analyzing...
                    </>
                  ) : noReviews ? 'No Reviews Left' : 'Get AI Analysis'}
                </button>
                
                {noReviews && !isLoading && (
                    <div className="alert alert-warning mt-3 text-center">
                        <p className="mb-2 fw-bold">You've used all your code reviews.</p>
                        <p>Select a new plan to add more reviews to your account.</p>
                        <button className="btn btn-success" onClick={() => navigate('/subscription')}>
                            <i className="bi bi-gem me-1"></i> Get More Reviews / Upgrade
                        </button>
                    </div>
                )}
              </div>

              <div className="report-container">
                {(isLoading || error || report) && (
                    <>
                        <h3 className="h4">AI Analysis Report</h3>
                        <div className="card shadow-sm">
                            <div className="card-body report-body">
                                {isLoading && <div className="loader text-center p-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status"><span className="visually-hidden">Loading...</span></div></div>}
                                {error && <div className="alert alert-danger m-3">{error}</div>}
                                {report && (
                                    <div className="report">
                                    <ReactMarkdown>{report}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
  );
}

export default Training;