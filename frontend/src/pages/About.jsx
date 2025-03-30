import React from 'react'
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const About = () => {
  return (
    <>
    <Navbar />
    <div className='mt-20 mx-6 sm:mx-12 md:mx-24'>

      <div className='text-center text-2xl pt-16 text-[#707070]'>
        <p>ABOUT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-16 flex flex-col md:flex-row gap-12 items-center'>
        <img className='w-full md:max-w-[360px] md:w-1/3 rounded-lg' src="https://i.pinimg.com/736x/6d/0e/33/6d0e331c759722dea5f51f88367f350a.jpg" alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/3 text-sm text-gray-600'>
          <p>Welcome to EduQuizAI, your AI-powered learning companion! Our platform leverages advanced AI technology to generate quizzes from PDFs, helping students and professionals reinforce their knowledge efficiently.</p>
          <p>EduQuizAI is designed to make learning interactive and personalized. Along with quiz generation, we have integrated an AI chatbot to assist you with instant explanations, making the learning process smooth and engaging.</p>
          <b className='text-gray-800'>Our Vision</b>
          <p>Our vision at EduQuizAI is to revolutionize education by providing AI-driven solutions that enhance learning experiences. We aim to bridge the gap between traditional studying methods and modern AI advancements, making education more accessible and effective.</p>
        </div>
      </div>

      <div className='text-xl my-6'>
        <p>WHY  <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
      </div>

      <div className='flex flex-col md:flex-row mb-20 gap-6'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] bg-gray-100 hover:bg-blue-500 hover:text-white transition-all duration-300 text-gray-700 cursor-pointer rounded-lg'>
          <b>AI-POWERED QUIZZES:</b>
          <p>Instantly generate quizzes from PDFs to test and enhance your understanding.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] bg-gray-100 hover:bg-blue-500 hover:text-white transition-all duration-300 text-gray-700 cursor-pointer rounded-lg'>
          <b>SMART AI CHATBOT: </b>
          <p>Get instant answers and explanations to clear your doubts effortlessly.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] bg-gray-100 hover:bg-blue-500 hover:text-white transition-all duration-300 text-gray-700 cursor-pointer rounded-lg'>
          <b>PERSONALIZED LEARNING:</b>
          <p>Customized quizzes and AI-driven insights to match your learning pace.</p>
        </div>
      </div>

    </div>
    <Footer/>
    </>
  )
}

export default About
