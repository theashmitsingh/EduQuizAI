import React from 'react';
import { FaRegPaperPlane } from "react-icons/fa";
import { IoCameraOutline } from "react-icons/io5";
import { MdOutlineKeyboardVoice } from "react-icons/md";

const SearchBar = ({ input, setInput, sendMessage }) => {
  return (
    <div className='flex items-center justify-center mb-5 gap-2'>
      <div className='relative w-1/2'>
        {/* Camera Icon (Left) */}
        <IoCameraOutline className='absolute ml-1 text-2xl left-3 top-1/2 transform -translate-y-1/2 text-zinc-500' />
        
        {/* Input Field */}
        <input 
          className='px-12 py-2 w-full border border-zinc-400 outline-none rounded-full' 
          type="text" 
          placeholder='Enter a prompt here...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        
        {/* Voice Icon (Right) */}
        <MdOutlineKeyboardVoice className='absolute mr-1 text-2xl right-3 top-1/2 transform -translate-y-1/2 text-zinc-500' />
      </div>

      {/* Send Button */}
      <button onClick={sendMessage} className='cursor-pointer px-3 py-3 rounded-full bg-blue-500 text-white'>
        <FaRegPaperPlane />
      </button>
    </div>
  );
};

export default SearchBar;
