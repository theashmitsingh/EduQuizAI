import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useLocation } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaArrowLeft, FaArrowRight, FaFlag, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";

const GenerateQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
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
        console.log("Fetching quiz for topic:", topic);
        const response = await axios.post(
          `${backendUrl}/api/quiz/generate-quiz`,
          { content: topic },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("Quiz Response:", response.data);
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
        console.log("Fetching PDF quiz for ID:", topic);
        const response = await axios.get(
          `${backendUrl}/api/quiz/generate-quiz`,
          { quizId: topic }, 
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("PDF Quiz Response:", response.data);
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

    const isPdfQuiz = topic.startsWith("pdf_");
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
      setMarkedForReview(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentQuestionIndex)) {
          newSet.delete(currentQuestionIndex);
        } else {
          newSet.add(currentQuestionIndex);
        }
        return newSet;
      });
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
      const correct = Array.isArray(q.answers) 
        ? q.answers 
        : Array.isArray(q.answer) 
          ? q.answer 
          : [q.answer];
      
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

      console.log("Submitting quiz with data:", { quizId, answers, score: newScore });
      await axios.post(
        `${backendUrl}/api/quiz/submit-quiz`,
        { quizId, answers, score: newScore },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      toast.success("Quiz submitted successfully!");
    } catch (err) {
      console.error("❌ Submit Error:", err);
      console.error("Submit Error Details:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to submit quiz.");
    }
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="mt-4 text-xl font-semibold text-blue-600">Loading your quiz...</p>
      <p className="mt-2 text-gray-600">This might take a few moments</p>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 mt-20">
        <div className="w-full px-4">
          <div className="flex">
            {/* Left Side - Navigation Panel */}
            <div className="w-1/4 bg-white rounded-xl shadow-lg p-6 h-[calc(100vh-12rem)] sticky top-24">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quiz Progress</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Questions Answered: {Object.keys(selectedAnswers).length}</span>
                  <span>Marked for Review: {markedForReview.size}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 ${
                        currentQuestionIndex === index
                          ? 'bg-blue-600 text-white shadow-md scale-105'
                          : markedForReview.has(index)
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : selectedAnswers[index]
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-sm text-gray-600">Current Question</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                    <span className="text-sm text-gray-600">Marked for Review</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span className="text-sm text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-sm text-gray-600">Not Answered</span>
                  </div>
                </div>

                {showAnswers && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Quiz Results</h4>
                    <p className="text-sm text-blue-600">
                      Score: {score} / {questions.length}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Question Panel */}
            <div className="w-3/4 pl-8">
              <div className="bg-white rounded-xl shadow-lg p-8 h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {markedForReview.has(currentQuestionIndex) ? 'Marked for Review' : 'Not Marked'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {markedForReview.has(currentQuestionIndex) && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                        Marked for Review
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    {questions[currentQuestionIndex]?.question}
                  </h3>
                  <div className="space-y-4">
                    {questions[currentQuestionIndex]?.options.map((option, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedAnswers[currentQuestionIndex] === option
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option}
                          checked={selectedAnswers[currentQuestionIndex] === option}
                          onChange={() => handleOptionChange(option)}
                          className="hidden"
                          disabled={showAnswers}
                        />
                        <div className={`w-6 h-6 border-2 rounded flex items-center justify-center mr-4 ${
                          selectedAnswers[currentQuestionIndex] === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedAnswers[currentQuestionIndex] === option && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-gray-700 text-lg">{option}</span>
                      </label>
                    ))}
                  </div>

                  {showAnswers && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800 font-medium">
                        Correct Answer: {questions[currentQuestionIndex]?.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6 border-t sticky bottom-0 bg-white">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleMarkForReview}
                      disabled={showAnswers}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        markedForReview.has(currentQuestionIndex)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      } hover:bg-opacity-80 transition duration-200`}
                    >
                      <FaFlag className="mr-2" />
                      {markedForReview.has(currentQuestionIndex) ? 'Unmark' : 'Mark for Review'}
                    </button>
                    <button
                      onClick={handleClearSelection}
                      disabled={showAnswers}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition duration-200 flex items-center"
                    >
                      <FaTimes className="mr-2" />
                      Clear Response
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`px-4 py-2 rounded-lg flex items-center ${
                        currentQuestionIndex === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      } transition duration-200`}
                    >
                      <FaArrowLeft className="mr-2" />
                      Previous
                    </button>
                    {currentQuestionIndex === questions.length - 1 ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={showAnswers}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-200 flex items-center"
                      >
                        <FaCheck className="mr-2" />
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-200 flex items-center"
                      >
                        Next
                        <FaArrowRight className="ml-2" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GenerateQuiz;
