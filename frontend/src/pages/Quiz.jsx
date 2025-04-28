import React, { useContext, useState } from "react";
import { FaCog, FaQuestionCircle, FaUserCircle, FaPlus, FaHistory, FaTimes } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [prompt, setPrompt] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [modalPrompt, setModalPrompt] = useState("");
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  const handlePreviousQuiz = (quizId) => {
    navigate(`/previous-quiz/${quizId}`);
  };

  const handleGetStarted = () => {
    navigate("/quiz-from-pdf");
  };

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      navigate(`/generate-quiz?topic=${encodeURIComponent(prompt.trim())}`);
    }
  };

  const handleModalGenerateClick = () => {
    if (modalPrompt.trim()) {
      navigate(`/generate-quiz?topic=${encodeURIComponent(modalPrompt.trim())}`);
    }
  };

  const openGenerateModal = () => {
    setShowGenerateModal(true);
  };

  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setModalPrompt("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 p-4 border-r border-gray-200 flex flex-col justify-between bg-white shadow-md">
        {/* Profile Section */}
        <div className="mb-4 flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm">
          <div className="relative">
            <FaUserCircle className="text-3xl text-blue-500" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">{userData?.name || "User"}</h2>
            <p className="text-xs text-blue-600 font-medium">Pro Trial</p>
          </div>
        </div>

        {/* Quiz Options */}
        <div className="space-y-3">
          <div>
            <input
              className="w-full border border-gray-200 outline-none px-3 py-2 rounded-lg bg-gray-50 focus:border-blue-500 transition-all duration-200 text-sm"
              type="text"
              placeholder="Enter your quiz topic..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              onClick={handleGenerateClick} 
              className={`w-full py-1.5 mt-2 rounded-lg transition-all duration-200 text-sm ${
                prompt.trim() 
                  ? "bg-blue-500 text-white hover:bg-blue-600" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!prompt.trim()}
            >
              Generate
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <FaHistory className="text-gray-500 text-sm" />
              <p className="font-semibold text-gray-700 text-sm">Previous Quizzes</p>
            </div>
            <ul className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              {userData?.userQuiz?.length > 0 ? (
                userData.userQuiz.map((item, index) => (
                  <li
                    key={item || index}
                    className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 border border-gray-100 text-sm"
                    onClick={() => handlePreviousQuiz(item)}
                  >
                    <p className="font-medium text-gray-700">{item.title || `Quiz ${index + 1}`}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Click to view details</p>
                  </li>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No quizzes found.</p>
              )}
            </ul>
          </div>
        </div>

        {/* Settings and Help Buttons */}
        <div className="mt-auto space-y-1.5">
          <button className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 text-sm">
            <FaCog className="text-gray-500" /> Settings
          </button>
          <button className="w-full flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-700 text-sm">
            <FaQuestionCircle className="text-gray-500" /> Help
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="w-4/5 flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Ready to Test Your Knowledge?</h1>
          <p className="text-base text-gray-600 mb-6">
            Start your learning journey by uploading a PDF or generating a quiz on any topic you want to explore.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
            >
              <FaPlus /> Upload PDF
            </button>
            <button
              onClick={openGenerateModal}
              className="px-6 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 border border-blue-500 shadow-md hover:shadow-lg text-sm"
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Generate Quiz Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 animate-slideUp">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Generate Quiz</h3>
              <button 
                onClick={closeGenerateModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter a topic or subject you'd like to create a quiz about. Our AI will generate questions for you.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="quiz-topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Topic
                  </label>
                  <input
                    id="quiz-topic"
                    type="text"
                    className="w-full border border-gray-300 outline-none px-4 py-2 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    placeholder="e.g., World History, JavaScript Basics, Biology"
                    value={modalPrompt}
                    onChange={(e) => setModalPrompt(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeGenerateModal}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalGenerateClick}
                    className={`flex-1 py-2 rounded-lg text-white transition-all duration-200 text-sm ${
                      modalPrompt.trim() 
                        ? "bg-blue-500 hover:bg-blue-600" 
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                    disabled={!modalPrompt.trim()}
                  >
                    Generate Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
