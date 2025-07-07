import React, { useState, useEffect } from "react";
import "./Questions.css"; 
import { useNavigate, NavLink } from "react-router-dom";
import { getRandomQuestions } from "./quizData";
import { useProgressTracking } from "../Content/Content";
import { decode } from "html-entities";

const SingleQuestion = React.memo(
  ({ questionData, onAnswerSelect, showResult }) => {
    const { question, shuffledAnswers, selectedAnswer, correctAnswer } =
      questionData;

    return (
      <div className="question-container">
        <h2 className="question-text">{decode(question)}</h2>
        <div className="answers-container">
          {shuffledAnswers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = correctAnswer === answer;

            let btnClass = "answer-btn";
            if (showResult) {
              if (isCorrect) btnClass += " correct";
              else if (isSelected) btnClass += " incorrect";
              else btnClass += " dimmed";
            } else if (isSelected) {
              btnClass += " selected";
            }

            return (
              <button
                key={index}
                className={btnClass}
                onClick={() => onAnswerSelect(question, answer)}
                disabled={showResult}
              >
                {decode(answer)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

const SecurityQuiz = () => {
  const navigate = useNavigate();
  const { saveQuizScore } = useProgressTracking();
  const [questions, setQuestions] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const setupQuiz = () => {
    const newQuestions = getRandomQuestions().map((q) => {
      const allAnswers = [...q.incorrect_answers, q.correct_answer];
      for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
      }
      return {
        question: q.question,
        shuffledAnswers: allAnswers,
        correctAnswer: q.correct_answer,
        selectedAnswer: "",
      };
    });
    setQuestions(newQuestions);
    setShowResult(false);
    setShowWarning(false);
    setScore(0);
  };

  useEffect(() => {
    setupQuiz();
  }, []);

  const handleAnswerSelect = (currentQuestion, answer) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.question === currentQuestion ? { ...q, selectedAnswer: answer } : q
      )
    );
  };

  const checkAnswers = () => {
    const allAnswered = questions.every((q) => q.selectedAnswer !== "");
    if (!allAnswered) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    let correctCount = 0;
    questions.forEach((q) => {
      if (q.selectedAnswer === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round(
      (correctCount / questions.length) * 100
    );
    setScore(scorePercentage);
    saveQuizScore("general_quiz", scorePercentage);
    setShowResult(true);
  };

  return (
    <div className="awareness">
      <div className="cc">
        <div className="d-flex flex-column h-100">
          <nav className="navbar navbar-expand flex-shrink-0 ps-3 pe-3">
            <NavLink className="navbar-brand me-auto navlogo" to="/">
              <img
                src="/logo.png"
                alt="Securify Logo"
                height="50"
                className="d-inline-block align-items-center me-2"
                style={{ marginTop: "-10px", marginBottom: "-5px" }}
              />
              Securify
            </NavLink>
            <div className="navbar-nav ms-auto">
              <li className="nav-item">
                <button
                  className="btn btn-outline-primary fw-bolder border-2"
                  onClick={() => navigate("/content")}
                >
                  <i className="bi bi-arrow-left-circle me-1"></i>
                  Topics
                </button>
              </li>
            </div>
          </nav>

          <div className="flex-grow-1" style={{ overflowY: "auto" }}>
            <div className="quiz-container">
              {questions.map((q) => (
                <SingleQuestion
                  key={q.question}
                  questionData={q}
                  onAnswerSelect={handleAnswerSelect}
                  showResult={showResult}
                />
              ))}

              <div className="text-center quiz-controls">
                {showWarning && (
                  <p className="warning-message">
                    Please answer all questions before checking the results.
                  </p>
                )}

                {showResult ? (
                  <div className="result-container">
                    <p className="result-message">
                      You scored {score}% on the quiz!
                    </p>
                    <button className="play-again-btn" onClick={setupQuiz}>
                      Play Again
                    </button>
                  </div>
                ) : (
                  <button className="check-btn" onClick={checkAnswers}>
                    Check Answers
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityQuiz;