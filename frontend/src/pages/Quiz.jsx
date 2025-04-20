import React, { useContext, useState } from "react";
import { FaCog, FaQuestionCircle, FaUserCircle } from "react-icons/fa";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  const handlePreviousQuiz = (quizId) => {
    navigate(`/previous-quiz/${quizId}`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      console.log("File uploaded:", file.name);
    }
  };

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      navigate(`/generate-quiz?topic=${encodeURIComponent(prompt.trim())}`);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 p-4 border-r flex flex-col justify-between">
        {/* Profile Section */}
        <div className="mb-4 flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
          <FaUserCircle className="text-4xl text-gray-500" />
          <div>
            <h2 className="text-lg font-semibold">{userData?.name || "User"}</h2>
            <p className="text-xs text-gray-500">Pro Trial</p>
          </div>
        </div>

        {/* Quiz Options */}
        <div>
          <input
            className="w-full border outline-none px-4 bg-zinc-100 py-2 rounded-lg"
            type="text"
            placeholder="Enter Prompt Here."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            onClick={handleGenerateClick} 
            className={`w-full py-2 mt-2 rounded-lg ${
              prompt.trim() ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800 cursor-not-allowed"
            }`}
            disabled={!prompt.trim()}
          >
            Generate
          </button>
          <p className="font-semibold mt-4 mb-2">Previous Quizzes</p>
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {userData?.userQuiz?.length > 0 ? (
              userData.userQuiz.map((item, index) => (
                <li
                  key={item || index}
                  className="p-2 bg-zinc-200 rounded-md cursor-pointer hover:bg-zinc-300 transition"
                  onClick={() => handlePreviousQuiz(item)}
                >
                  {item.title || `Quiz ${index + 1}`}
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">No quizzes found.</p>
            )}
          </ul>
        </div>

        {/* Settings and Help Buttons */}
        <div className="mt-auto space-y-2">
          <button className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200">
            <FaCog /> Settings
          </button>
          <button className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200">
            <FaQuestionCircle /> Help
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      <div className="w-4/5 flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-2xl font-bold">Ready For Quiz</h1>
        <p className="mt-2 text-gray-600 max-w-md">
          Upload a PDF containing questions, and our system will generate a quiz based on it.
        </p>
        
        {/* Upload PDF Button */}
        <input type="file" accept=".pdf" id="fileInput" className="hidden" onChange={handleFileUpload} />
        <label htmlFor="fileInput" className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer">
          Upload PDF
        </label>
        
        {selectedFile && <p className="mt-2 text-green-600">{selectedFile} uploaded successfully!</p>}
      </div>
    </div>
  );
};

export default Quiz;
