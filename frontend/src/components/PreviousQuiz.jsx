import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PreviousQuiz = () => {
  const { quizId } = useParams();
  const { userData, backendUrl } = useContext(AppContext);
  const [quizDetails, setQuizDetails] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (!quizId) return;

    console.log("Quiz ID: ", quizId);

    const fetchQuizDetails = async () => {
      try {
        const response = await axios.post(
          `${backendUrl}/api/quiz/previous-quiz`,
          { id: quizId },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );

        console.log("Response: ", response);

        if (response.data) {
          console.log("Response Data: ", response.data);
          setQuizDetails(response.data);
          console.log("Response data: ", response.data.data);
        } else {
          toast.error("Quiz not found or is empty!");
        }
      } catch (error) {
        toast.error("Failed to fetch previous quiz.");
        console.error(error);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  if (!quizDetails) {
    return (
      <>
        <div className="flex justify-center items-center h-screen text-xl font-semibold">
          Loading Previous Quiz...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-6 mt-18">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-600">
          Previous Quiz Review
        </h2>

        <div className="space-y-8">
          {quizDetails?.data?.questions?.map((q, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md space-y-4"
            >
              <h3 className="font-semibold text-lg">
                {index + 1}. {q.question}
              </h3>
              <ul className="space-y-2">
                {q.options?.map((option, i) => {
                  const isSelected = q.selectedOptions?.includes(option);
                  const isCorrect = q.correctAnswers?.includes(option);
                  return (
                    <li
                      key={i}
                      className={`px-4 py-2 rounded-md border ${isCorrect
                        ? "bg-green-100 border-green-500"
                        : isSelected
                          ? "bg-red-100 border-red-400"
                          : "bg-gray-100"
                        }`}
                    >
                      {String.fromCharCode(97 + i)}) {option}
                    </li>
                  );
                })}
              </ul>
              <p className="text-green-600 font-semibold">
                Correct Answer: {q.correctAnswers?.length ? q.correctAnswers.join(", ") : "Not Available"}
              </p>

              <p className={`font-semibold ${q.isCorrect ? "text-green-600" : "text-red-600"}`}>
                You answered this {q.isCorrect ? "correctly" : "incorrectly"}.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-xl font-semibold">
          Total Score: {quizDetails?.data?.score || 0} / {quizDetails?.data?.questions?.length || 0}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PreviousQuiz;
