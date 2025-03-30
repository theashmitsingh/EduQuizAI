import React, { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  FaRegPaperPlane,
  FaCog,
  FaQuestionCircle,
  FaUserCircle,
} from "react-icons/fa";
import { CiLight, CiDark } from "react-icons/ci";
import SearchBar from "../components/SearchBar";
import { AppContext } from "../context/AppContext";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { userData } = useContext(AppContext);

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
      typeEffect(replyText);  // 👈 Call the function here
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
  
        // If last message is from bot, update it; else, add a new one
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
    }, 10);  // Adjust speed if needed
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 p-4 border-r flex flex-col justify-between">
        {/* Profile Section */}
        <div className="mb-4 flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
          <FaUserCircle className="text-4xl text-gray-500" />
          <div>
            <h2 className="text-lg font-semibold">
              {userData?.name || "User"}
            </h2>
            <p className="text-xs text-gray-500">
              {userData ? "Pro Trial" : "Free Trail"}
            </p>
          </div>
        </div>

        {/* Chat Options */}
        <div>
          <button className="w-full py-2 bg-blue-500 text-white mb-3 rounded-lg cursor-pointer">
            + New Chat
          </button>
          <input
            className="w-full border outline-none px-4 bg-zinc-100 py-2 rounded-lg"
            type="text"
            placeholder="Search"
          />
          <ul className="mt-5">
            <li className="p-2 bg-zinc-200 rounded-md mb-2 cursor-pointer">
              Previous Chat 1
            </li>
            <li className="p-2 bg-zinc-200 rounded-md mb-2 cursor-pointer">
              Previous Chat 2
            </li>
            <li className="p-2 bg-zinc-200 rounded-md cursor-pointer">
              Previous Chat 3
            </li>
          </ul>
        </div>

        {/* Settings and Help Buttons */}
        <div className="mt-auto space-y-2">
          <button className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
            <FaCog /> Settings
          </button>
          <button className="w-full flex items-center gap-2 p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
            <FaQuestionCircle /> Help
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-4/5 flex flex-col">
        <div className="flex justify-between items-center p-2 border-b border-zinc-300 bg-white">
          <h2 className="text-2xl font-bold">Chat</h2>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-100 rounded-md cursor-pointer">
              <CiLight size={20} />
            </button>
            <button className="p-2 bg-gray-100 rounded-md cursor-pointer">
              <CiDark size={20} />
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
        {messages.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full text-gray-500 text-lg">
              <p className="text-4xl text-black font-semibold">Hello {userData ? userData.name : 'User'}</p>
              <p className="underline underline-offset-4">How can I assist you today?</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start mb-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* User Message */}
              {msg.sender === "user" && (
                <div className="flex items-end gap-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {userData?.name || "User"} ·{" "}
                      {formatTimestamp(msg.timestamp)}
                    </p>
                    <div className=" text-zinc-700 p-3 rounded-lg w-96">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                  <FaUserCircle className="text-2xl text-gray-500" />
                </div>
              )}

              {/* Bot Message */}
              {msg.sender === "bot" && (
                <div className="flex items-end gap-2">
                  <FaUserCircle className="text-2xl text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">
                      ChatBot · {formatTimestamp(msg.timestamp)}
                    </p>
                    <div className="bg-gray-100 text-black p-3 rounded-lg w-2/3">
                      {msg.text}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && <div className="p-2 text-gray-500">Typing...</div>}
        </div>

        {/* Search Bar Component */}
        <SearchBar
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
        />

        <p className="text-center text-xs mb-10">
          Complimentary Sneek Peek of Research. ChatAI has the potential to
          generate incorrect information.
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
