import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { FaArrowLeft, FaArrowRight, FaFlag, FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const QuizFromPDF = () => {
  const { userData, backendUrl } = useContext(AppContext);
  const [quizData, setQuizData] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [quizId, setQuizId] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdfFile", file);
    formData.append("userId", userData.userId);

    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(
        `${backendUrl}/api/quiz/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      console.log("Uploaded Response:", response.data);
      setQuizData(response.data.quiz);
      setQuizId(response.data.quizId);
      setIsUploaded(true);
      // Initialize selected answers
      const initialAnswers = {};
      response.data.quiz.forEach((_, index) => {
        initialAnswers[index] = null;
      });
      setSelectedAnswers(initialAnswers);
    } catch (error) {
      console.error("❌ Error uploading PDF:", error);
      setError("Something went wrong while uploading PDF.");
      setIsUploaded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, option) => {
    if (!showAnswers) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: option
      }));
    }
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

  const handleClearResponse = () => {
    if (!showAnswers) {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: null
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    let newScore = 0;
    const answers = quizData.map((q, index) => {
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
      if (!quizId) {
        toast.error("Quiz ID missing!");
        return;
      }

      console.log("Submitting quiz with data:", { quizId, answers, score: newScore });
      await axios.post(
        `${backendUrl}/api/quiz/submit-quiz`,
        { quizId, answers, score: newScore, userId: userData.userId },
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
      <p className="mt-4 text-xl font-semibold text-blue-600">Generating your quiz...</p>
      <p className="mt-2 text-gray-600">This might take a few moments</p>
    </div>
  );

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 mt-20">
      {!isUploaded && !isLoading && (
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload your PDF to Generate Quiz</h1>
            <p className="text-gray-600 mb-8">Upload any PDF document and we'll create a quiz based on its content.</p>
            <input
              type="file"
              accept=".pdf"
              id="fileInput"
              className="hidden"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="fileInput"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer shadow-lg hover:bg-blue-700 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Upload PDF
            </label>
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner />}

      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {isUploaded && quizData && (
        <div className="w-full px-4 mt-8">
          <div className="flex">
            {/* Left Side - Navigation Panel */}
            <div className="w-1/4 bg-white rounded-xl shadow-lg p-6 h-[calc(100vh-12rem)] sticky top-24">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quiz Progress</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Questions Answered: {Object.values(selectedAnswers).filter(Boolean).length}</span>
                  <span>Marked for Review: {markedForReview.size}</span>
                </div>
                {showAnswers && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Quiz Results</h4>
                    <p className="text-sm text-blue-600">
                      Score: {score} / {quizData.length}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {quizData.map((_, index) => (
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
              </div>
            </div>

            {/* Right Side - Question Panel */}
            <div className="w-3/4 pl-8">
              <div className="bg-white rounded-xl shadow-lg p-8 h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      Question {currentQuestionIndex + 1} of {quizData.length}
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
                    {quizData[currentQuestionIndex].question}
                  </h3>
                  <div className="space-y-4">
                    {quizData[currentQuestionIndex].options.map((option, idx) => (
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
                          onChange={() => handleAnswerSelect(currentQuestionIndex, option)}
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
                        Correct Answer: {quizData[currentQuestionIndex].answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-6 border-t sticky bottom-0 bg-white">
                  <div className="flex space-x-3">
                    <button
                      onClick={handleMarkForReview}
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
                      onClick={handleClearResponse}
                      className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition duration-200 flex items-center"
                    >
                      <FaTimes className="mr-2" />
                      Clear Response
                    </button>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handlePrevious}
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
                    {currentQuestionIndex === quizData.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={showAnswers}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition duration-200 flex items-center"
                      >
                        <FaCheck className="mr-2" />
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
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
      )}
    </div>
    <Footer />
    </>
  );
};

export default QuizFromPDF;
