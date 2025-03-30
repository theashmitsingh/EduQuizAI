import React from 'react'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <h1 className='w-28 sm:w-32 font-semibold text-2xl cursor-pointer'>EduQuizAI</h1>
          <p className='w-full md:w-2/3 mt-10 text-gray-600 leading-6'>EduQuizAI is your AI-powered learning assistant, helping you generate quizzes from PDFs and providing instant answers through our smart chatbot. Enhance your study experience with interactive and efficient learning.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Features</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+1-212-456-7890</li>
            <li>theashmitsingh11@gmail.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2024 @ EduQuizAI.com - All Rights Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
