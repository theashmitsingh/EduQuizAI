import React, { useContext, useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  FaRegPaperPlane,
  FaCog,
  FaQuestionCircle,
  FaUserCircle,
  FaPlus,
  FaHistory,
  FaRobot,
} from "react-icons/fa";
import { CiLight, CiDark } from "react-icons/ci";
import SearchBar from "../components/SearchBar";
import { AppContext } from "../context/AppContext";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { userData } = useContext(AppContext);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const timestamp = new Date().toISOString();
    const newMessages = [...messages, { text: input, sender: "user", timestamp }];
  
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
  
    try {
      const response = await fetch("http://localhost:3000/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
  
      const data = await response.json();
      setIsTyping(false);
  
      let replyText = data.reply || "Sorry, I didn't understand that.";
      typeEffect(replyText);
    } catch (error) {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        {
          text: "Error: Unable to connect to chatbot.",
          sender: "bot",
          timestamp,
        },
      ]);
    }
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: now.getFullYear() !== date.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const typeEffect = (text) => {
    let i = 0;
    const typingInterval = setInterval(() => {
      setMessages((prevMessages) => {
        const lastMsg = prevMessages[prevMessages.length - 1];
  
        if (lastMsg?.sender === "bot") {
          prevMessages[prevMessages.length - 1] = {
            ...lastMsg,
            text: text.substring(0, i + 1),
          };
        } else {
          prevMessages.push({ text: text.substring(0, i + 1), sender: "bot", timestamp: new Date().toISOString() });
        }
  
        return [...prevMessages];
      });
  
      i++;
      if (i === text.length) clearInterval(typingInterval);
    }, 10);
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
            <h2 className="text-base font-bold text-gray-800">
              {userData?.name || "User"}
            </h2>
            <p className="text-xs text-blue-600 font-medium">
              {userData ? "Pro Trial" : "Free Trial"}
            </p>
          </div>
        </div>

        {/* Chat Options */}
        <div className="space-y-3">
          <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm">
            <FaPlus /> New Chat
          </button>
          <div className="relative">
            <input
              className="w-full border border-gray-200 outline-none px-3 py-2 rounded-lg bg-gray-50 focus:border-blue-500 transition-all duration-200 text-sm"
              type="text"
              placeholder="Search conversations..."
            />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <FaHistory className="text-gray-500 text-sm" />
              <p className="font-semibold text-gray-700 text-sm">Recent Chats</p>
            </div>
            <ul className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              <li className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 border border-gray-100 text-sm">
                <p className="font-medium text-gray-700">Previous Chat 1</p>
                <p className="text-xs text-gray-500 mt-0.5">2 hours ago</p>
              </li>
              <li className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 border border-gray-100 text-sm">
                <p className="font-medium text-gray-700">Previous Chat 2</p>
                <p className="text-xs text-gray-500 mt-0.5">5 hours ago</p>
              </li>
              <li className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-all duration-200 border border-gray-100 text-sm">
                <p className="font-medium text-gray-700">Previous Chat 3</p>
                <p className="text-xs text-gray-500 mt-0.5">1 day ago</p>
              </li>
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

      {/* Main Chat Area */}
      <div className="w-4/5 flex flex-col bg-white">
        <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <FaRobot className="text-xl text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">AI Assistant</h2>
          </div>
          <div className="flex space-x-2">
            <button className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <CiLight size={18} className="text-gray-600" />
            </button>
            <button className="p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
              <CiDark size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full text-center">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Hello {userData ? userData.name : 'User'}! 👋
                </h3>
                <p className="text-base text-gray-600 mb-4">
                  I'm your AI assistant. How can I help you today?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 text-left">
                    <p className="font-medium text-gray-800 text-sm">Help with coding</p>
                    <p className="text-xs text-gray-500">Get assistance with programming</p>
                  </button>
                  <button className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 text-left">
                    <p className="font-medium text-gray-800 text-sm">Answer questions</p>
                    <p className="text-xs text-gray-500">Ask me anything</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start mb-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "user" ? (
                <div className="flex items-end gap-2 max-w-[70%]">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">
                      {userData?.name || "User"} · {formatTimestamp(msg.timestamp)}
                    </p>
                    <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none shadow-sm text-sm">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="relative">
                    <FaUserCircle className="text-2xl text-blue-500" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-2 max-w-[70%]">
                  <div className="relative">
                    <FaRobot className="text-2xl text-gray-500" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">
                      AI Assistant · {formatTimestamp(msg.timestamp)}
                    </p>
                    <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none shadow-sm text-sm">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Search Bar Component */}
        <div className="p-3 bg-white border-t border-gray-200">
          <SearchBar
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
          />
        </div>

        <p className="text-center text-xs text-gray-500 p-3 bg-gray-50">
          AI Assistant may occasionally generate incorrect information. Please verify important details.
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
