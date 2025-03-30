import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { useLocation } from "react-router-dom";

const GenerateQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
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
    console.log("Backend URL: ", backendUrl);
    const fetchQuiz = async () => {
        try {
          const response = await axios.post(
            `${backendUrl}/api/quiz/generate-quiz`,
            { content: topic },
            { headers: { "Content-Type": "application/json" } }
          );
      
          console.log("✅ Received Quiz Data:", response.data);
      
          if (!response.data.quiz || response.data.quiz.length === 0) {
            throw new Error("No quiz data received.");
          }
      
          setQuestions(response.data.quiz);
        } catch (error) {
          console.error("❌ Error fetching quiz:", error);
          toast.error(error.response?.data?.message || "Failed to load quiz. Try again!");
        } finally {
          setLoading(false);
        }
      };
      
  
    fetchQuiz();
  }, []);
  

  const handleOptionChange = (questionIndex, option) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
  };

  const calculateScore = () => {
    let newScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        newScore++;
      }
    });

    setScore(newScore);
    setShowAnswers(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading Quiz...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Your Quiz</h1>
      
      <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        {questions.map((q, index) => (
          <div key={index} className="mb-6">
            <p className="font-semibold">{index + 1}. {q.question}</p>
            <div className="mt-2 space-y-2">
              {q.options.map((option, i) => (
                <label key={i} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    checked={selectedAnswers[index] === option}
                    onChange={() => handleOptionChange(index, option)}
                    className="hidden peer"
                  />
                  <span
                    className={`p-2 w-full text-center rounded-md transition ${
                      selectedAnswers[index] === option ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>

            {showAnswers && (
              <p className="mt-2 text-green-600 font-semibold">Correct Answer: {q.answer}</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={calculateScore}
          className="mt-4 w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Submit Quiz
        </button>
      </form>

      {score !== null && (
        <h2 className="text-lg font-semibold mt-4">
          Your Score: {score} / {questions.length}
        </h2>
      )}
    </div>
  );
};

export default GenerateQuiz;
