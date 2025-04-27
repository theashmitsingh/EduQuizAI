import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const GenerateQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const topic = queryParams.get("topic");

  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    if (!topic) {
      toast.error("No topic provided!");
      setLoading(false);
      return;
    }

    axios.defaults.withCredentials = true;

    const fetchQuiz = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/quiz/generate-quiz`,
          { content: topic },
          { headers: { "Content-Type": "application/json" } }
        );
        const questionsArray = response.data.quiz;
        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
          toast.error("Quiz has no questions.");
          return;
        }
        setQuestions(questionsArray.map(q => ({ ...q, quizId: response.data.quizId || "unknown" })));
      } catch (error) {
        console.error("❌ Error fetching quiz:", error);
        toast.error(error.response?.data?.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    const fetchQuizFromPDF = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/pdf/get-quiz/${topic}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const questionsArray = response.data.quiz;
        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
          toast.error("Quiz has no questions.");
          return;
        }
        setQuestions(questionsArray.map(q => ({ ...q, quizId: response.data.quizId || "unknown" })));
      } catch (error) {
        console.error("❌ Error fetching quiz from PDF:", error);
        toast.error(error.response?.data?.message || "Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    const isPdfQuiz = topic.startsWith("pdf_"); // 👈 if your pdf ids start with "pdf_"
    if (isPdfQuiz) {
      fetchQuizFromPDF();
    } else {
      fetchQuiz();
    }
  }, [topic, backendUrl]);

  const handleOptionChange = (option) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleClearSelection = () => {
    setSelectedAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestionIndex];
      return newAnswers;
    });
  };

  const handleMarkForReview = () => {
    if (!showAnswers) {
      setMarkedForReview({ ...markedForReview, [currentQuestionIndex]: true });
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    let newScore = 0;
    const answers = questions.map((q, index) => {
      const selected = selectedAnswers[index] || [];
      const correct = Array.isArray(q.answers) ? q.answers : [q.answer];
      const selectedArray = Array.isArray(selected) ? selected : [selected];

      const isCorrect =
        selectedArray.length === correct.length &&
        selectedArray.every((opt) => correct.includes(opt));

      if (isCorrect) newScore++;

      return {
        question: q.question,
        selectedOptions: selectedArray,
        correctAnswers: correct,
        isCorrect,
      };
    });

    setScore(newScore);
    setShowAnswers(true);

    try {
      const quizId = questions[0]?.quizId;
      if (!quizId) {
        toast.error("Quiz ID missing!");
        return;
      }

      await axios.post(
        `${backendUrl}/api/quiz/submit-quiz`,
        { quizId, answers, score: newScore },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      toast.success("Quiz submitted successfully!");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      toast.error("Failed to submit quiz.");
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-screen text-xl font-semibold">
          Loading Quiz...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen bg-gray-100 p-4 gap-4 mt-18">
        <div className="w-1/4 h-96 bg-white p-4 rounded-lg shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-500">Attempted Questions</h2>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center rounded-full shadow-lg text-black border font-semibold cursor-pointer 
                    ${selectedAnswers[index] ? "bg-green-500" : markedForReview[index] ? "bg-blue-500" : "bg-white border-zinc-600"} 
                    ${showAnswers && !selectedAnswers[index] ? "bg-red-500" : ""}`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm">
            <p>Marked for Review: {Object.keys(markedForReview).length}</p>
            {showAnswers && (
              <p className="mt-2">Correct: {score} | Incorrect: {questions.length - score}</p>
            )}
          </div>
        </div>

        <div className="w-3/4 bg-white p-6 rounded-lg shadow-lg max-h-[70vh] flex flex-col justify-between">
          <div>
            {questions[currentQuestionIndex] && (
              <p className="font-semibold">
                {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
              </p>
            )}
            <div className="mt-2 space-y-2">
              {questions[currentQuestionIndex]?.options.map((option, i) => (
                <label key={i} className="flex items-center space-x-2 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={selectedAnswers[currentQuestionIndex] === option}
                    onChange={() => handleOptionChange(option)}
                    className="cursor-pointer"
                    disabled={showAnswers}
                  />
                  <span className="cursor-pointer" onClick={() => handleOptionChange(option)}>
                    {String.fromCharCode(97 + i)}) {option}
                  </span>
                </label>
              ))}
            </div>
            {showAnswers && (
              <p className="mt-2 font-semibold text-green-600">
                Answer: {questions[currentQuestionIndex]?.answer}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full mt-4">
            <div className="flex justify-between w-full gap-2">
              <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="py-2 px-4 bg-gray-500 w-full cursor-pointer text-white rounded-md">Previous</button>
              <button onClick={handleClearSelection} className="py-2 w-full cursor-pointer px-4 bg-yellow-500 text-white rounded-md">Clear Selection</button>
              <button onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="py-2 w-full cursor-pointer px-4 bg-green-500 text-white rounded-md">Save and Next</button>
            </div>
            <div className="flex flex-row gap-2">
              <button onClick={handleMarkForReview} disabled={showAnswers} className="py-2 shadow-lg cursor-pointer px-4 bg-blue-500 text-white rounded-md w-full">Mark for Review</button>
              <button onClick={handleSubmitQuiz} disabled={showAnswers} className="py-2 shadow-lg cursor-pointer px-4 bg-red-500 text-white rounded-md w-full">Submit</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GenerateQuiz;
