import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";


const Header = () => {

  const { userData } = useContext(AppContext);
  // console.log("Header userData:", userData);
  
  const navigate = useNavigate();
  const handleClick = () => {
    if (userData) {
      navigate("/quiz");
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="flex flex-col items-center mt-64 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt=""
        className="w-36 h-36 rounded-full mb-6"
      />

      <h1 className="flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2">
        Hey {userData ? userData.name : 'User'}!{" "}
        <img className="w-8 aspect-square" src={assets.hand_wave} alt="" />
      </h1>

      <h2 className="text-3xl sm:text-5xl font-semibold mb-4">Welcome to EduQuizAI</h2>

      <p className="mb-8 max-w-md">
        Effortlessly generate quizzes from PDFs and get instant AI-powered assistance in no time!
      </p>

      <button onClick={handleClick} className="border border-gray-500 cursor-pointer rounded-full px-8 py-2.5 hover:bg-gray-200 transition-all duration-300">Get Started</button>
    </div>
  );
};

export default Header;
