import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center mt-64 px-4 text-center text-gray-800">
      <img
        src={assets.header_img}
        alt="Not Found"
        className="w-36 h-36 rounded-full mb-6"
      />

      <h1 className="text-3xl sm:text-5xl font-semibold mb-4">Page Not Found</h1>

      <p className="mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist. It might have been
        removed, renamed, or is temporarily unavailable.
      </p>

      <button
        onClick={() => navigate("/")}
        className="border border-gray-500 cursor-pointer rounded-full px-8 py-2.5 hover:bg-gray-200 transition-all duration-300"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
