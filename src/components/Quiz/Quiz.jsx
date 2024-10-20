import React, { useState, useEffect } from "react";
import "./Quiz.css";
import { CheckCircle, XCircle } from "lucide-react";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      shuffleAnswers();
    }
  }, [questions, currentQuestionIndex]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://mocki.io/v1/fc67aebb-5d70-48b5-937f-5d64cfaf86ab",
      );
      const data = await response.json();
      setQuestions(data.results);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load quiz questions. Please try again later.");
      setIsLoading(false);
    }
  };

  const shuffleAnswers = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answers = [
      ...currentQuestion.incorrect_answers,
      currentQuestion.correct_answer,
    ];
    const shuffled = answers.sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
  };

  const handleAnswer = (answer) => {
    if (isAnswerChecked || !questions.length) return;

    setSelectedAnswer(answer);
    setIsAnswerChecked(true);

    const currentQuestion = questions[currentQuestionIndex];
    if (answer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswerChecked(false);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsLoading(true);
    setError(null);
    setShuffledAnswers([]);
    fetchQuestions();
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="error">
        No questions available. Please try again later.
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="container result">
        <h1>Quiz Result</h1>
        <p>
          You got <span className="highlight">{score}</span> out of{" "}
          <span className="highlight">{questions.length}</span> correct!
        </p>
        <button onClick={restartQuiz}>Restart Quiz</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container">
      <h1>Quiz App</h1>
      <div className="question-section">
        <h2 dangerouslySetInnerHTML={{ __html: currentQuestion.question }}></h2>
        <ul className="answers-list">
          {shuffledAnswers.map((answer, index) => (
            <li
              key={index}
              onClick={() => handleAnswer(answer)}
              className={`answer ${
                isAnswerChecked
                  ? answer === currentQuestion.correct_answer
                    ? "correct"
                    : selectedAnswer === answer
                      ? "incorrect"
                      : ""
                  : ""
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: answer }}></span>
              {isAnswerChecked && answer === currentQuestion.correct_answer && (
                <CheckCircle className="icon" />
              )}
              {isAnswerChecked &&
                selectedAnswer === answer &&
                answer !== currentQuestion.correct_answer && (
                  <XCircle className="icon" />
                )}
            </li>
          ))}
        </ul>
      </div>
      <div className="quiz-info">
        <div className="progress">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="score">
          Score: {score}/{currentQuestionIndex + 1}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
