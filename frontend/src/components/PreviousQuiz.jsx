import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaCheck, FaTimes, FaClock, FaCalendarAlt, FaTrophy } from "react-icons/fa";

const PreviousQuiz = () => {
  const { quizId } = useParams();
  const { userData, backendUrl } = useContext(AppContext);
  const [quizDetails, setQuizDetails] = useState(null);

  useEffect(() => {
    if (!quizId || !userData) return;

    const fetchQuizDetails = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/quiz/previous-quiz`,
          { userId: userData.userId, quizId },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        if (response.data) {
          setQuizDetails(response.data);
        } else {
          toast.error("Quiz not found or is empty!");
        }
      } catch (error) {
        toast.error("Failed to fetch previous quiz.");
        console.error("Error response:", error.response);
        console.error("Error details:", error);
      }
    };

    fetchQuizDetails();
  }, [quizId, userData]);

  if (!quizDetails) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quiz Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Quiz Review
                </h2>
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  {formatDate(quizDetails?.data?.createdAt || new Date())}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {quizDetails?.data?.score || 0}
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(((quizDetails?.data?.score || 0) / (quizDetails?.data?.answers?.length || 1)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="space-y-6">
            {quizDetails?.data?.answers?.map((answer, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Question {index + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    {answer.selectedOptions.length === 0 && (
                      <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Not Attempted
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      answer.isCorrect 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {answer.isCorrect ? "Correct" : "Incorrect"}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-6">{answer.question}</p>

                <div className="space-y-3">
                  {answer.options?.map((option, i) => {
                    const isSelected = answer.selectedOptions.includes(option);
                    const isCorrect = answer.correctAnswers.includes(option);
                    return (
                      <div
                        key={i}
                        className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : isCorrect
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                          isSelected
                            ? isCorrect
                              ? "bg-green-500"
                              : "bg-red-500"
                            : isCorrect
                            ? "bg-green-500"
                            : "bg-gray-200"
                        }`}>
                          {isSelected ? (
                            isCorrect ? (
                              <FaCheck className="text-white" />
                            ) : (
                              <FaTimes className="text-white" />
                            )
                          ) : isCorrect ? (
                            <FaCheck className="text-white" />
                          ) : null}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium flex items-center">
                    <FaCheck className="mr-2 text-green-500" />
                    Correct Answer: {answer.correctAnswers.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaTrophy className="text-3xl text-yellow-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Final Score</h3>
                  <p className="text-gray-600">
                    {quizDetails?.data?.score || 0} out of {quizDetails?.data?.answers?.length || 0} questions
                  </p>
                </div>
              </div>
              <div className="text-4xl font-bold text-blue-600">
                {Math.round(((quizDetails?.data?.score || 0) / (quizDetails?.data?.answers?.length || 1)) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PreviousQuiz;
