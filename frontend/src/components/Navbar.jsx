import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);

      if (data.success) {
        navigate('/verify-email');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }
  

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  }

  

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 ">
      <h1 onClick={()=> navigate("/")} className="w-28 sm:w-32 font-semibold text-2xl cursor-pointer">EduQuizAI</h1>

      <nav className="flex gap-8 text-gray-800 text-lg">
        <button onClick={() => navigate('/')} className="hover:text-gray-500 cursor-pointer">Home</button>
        <button onClick={() => navigate('/chatbot')} className="hover:text-gray-500 cursor-pointer">ChatBot</button>
        <button onClick={() => navigate('/about')} className="hover:text-gray-500 cursor-pointer">About</button>
        <button onClick={() => navigate('/contact')} className="hover:text-gray-500 cursor-pointer">Contact</button>
      </nav>

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}
          <div className="absolute w-38 hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10">
            <ul className="list-none m-0 px-1 py-2 bg-gray-100 text-sm">
              
              {!userData.isAccountVerified && <li onClick={sendVerificationOtp} className="py-1 px-2 hover:bg-gray-200 cursor-pointer">Verify Email</li>
              }
              
              <li onClick={()=> navigate('/profile')} className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">My Profile</li>
              <li onClick={logout} className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">Logout</li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 cursor-pointer text-gray-800 hover:bg-gray-200 transition-all duration-300"
        >
          Login <img src={assets.arrow_icon} alt="" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
